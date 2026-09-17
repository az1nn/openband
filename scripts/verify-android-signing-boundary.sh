#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
TMP_ROOT="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/openband-signing-boundary-${RANDOM}-${RANDOM}"
mkdir -p "$TMP_ROOT"
trap 'rm -rf "$TMP_ROOT"' EXIT

fail() {
  echo "android-signing-boundary: $*" >&2
  exit 1
}

find_apksigner() {
  local sdk_root="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
  [[ -n "$sdk_root" ]] || fail "ANDROID_SDK_ROOT or ANDROID_HOME is required"
  local tool
  tool="$(find "$sdk_root/build-tools" -type f -name apksigner -print 2>/dev/null | sort -V | tail -n 1)"
  [[ -n "$tool" && -x "$tool" ]] || fail "apksigner is unavailable"
  printf '%s\n' "$tool"
}

expect_gradle_failure() {
  local name="$1"
  shift
  local log="$TMP_ROOT/${name}.log"
  if "$@" >"$log" 2>&1; then
    fail "expected Gradle failure for ${name}"
  fi
  printf '%s\n' "$log"
}

assert_log_excludes() {
  local log="$1"
  local value="$2"
  if [[ -n "$value" ]] && grep -Fq -- "$value" "$log"; then
    fail "sensitive canary leaked into ${log}"
  fi
}

assert_unsigned_apk() {
  local apk="$1"
  if "$APKSIGNER" verify "$apk" >/dev/null 2>&1; then
    fail "verification APK is unexpectedly signed: ${apk}"
  fi
}

find_release_apk() {
  find app/build/outputs/apk/release -maxdepth 1 -type f -name '*.apk' -print | head -n 1
}

cd "$ROOT_DIR"
npm ci

APKSIGNER="$(find_apksigner)"
cd "$ANDROID_DIR"

# 1. Default verification path must package release without signing authority.
rm -rf app/build/outputs/apk/release
./gradlew assembleRelease
UNSIGNED_APK="$(find_release_apk)"
[[ -n "$UNSIGNED_APK" ]] || fail "default verification release APK was not produced"
assert_unsigned_apk "$UNSIGNED_APK"

# 2. Explicit verification mode must preserve the same unsigned trust domain.
rm -rf app/build/outputs/apk/release
./gradlew assembleRelease -Popenband.android.signingMode=verification
EXPLICIT_UNSIGNED_APK="$(find_release_apk)"
[[ -n "$EXPLICIT_UNSIGNED_APK" ]] || fail "explicit verification release APK was not produced"
assert_unsigned_apk "$EXPLICIT_UNSIGNED_APK"

# 3. Unsupported mode must fail closed.
INVALID_LOG="$(expect_gradle_failure invalid-mode ./gradlew :app:tasks -Popenband.android.signingMode=invalid)"
grep -Fq "Expected verification or production" "$INVALID_LOG" || fail "invalid mode did not fail with stable policy message"

# 4. Production with no inputs must fail closed.
unset OPENBAND_ANDROID_KEYSTORE_PATH OPENBAND_ANDROID_KEYSTORE_PASSWORD OPENBAND_ANDROID_KEY_ALIAS OPENBAND_ANDROID_KEY_PASSWORD || true
NO_INPUT_LOG="$(expect_gradle_failure no-inputs ./gradlew :app:tasks -Popenband.android.signingMode=production)"
grep -Fq "Production Android signing requires external inputs" "$NO_INPUT_LOG" || fail "missing-input policy message absent"

CANARY_STORE_PASSWORD="store-canary-${RANDOM}-${RANDOM}"
CANARY_KEY_PASSWORD="key-canary-${RANDOM}-${RANDOM}"
CANARY_ALIAS="ci-canary-alias-${RANDOM}"
CANARY_PATH="$TMP_ROOT/nonexistent-canary-${RANDOM}.p12"
INPUT_NAMES=(
  OPENBAND_ANDROID_KEYSTORE_PATH
  OPENBAND_ANDROID_KEYSTORE_PASSWORD
  OPENBAND_ANDROID_KEY_ALIAS
  OPENBAND_ANDROID_KEY_PASSWORD
)

set_canary_inputs() {
  export OPENBAND_ANDROID_KEYSTORE_PATH="$CANARY_PATH"
  export OPENBAND_ANDROID_KEYSTORE_PASSWORD="$CANARY_STORE_PASSWORD"
  export OPENBAND_ANDROID_KEY_ALIAS="$CANARY_ALIAS"
  export OPENBAND_ANDROID_KEY_PASSWORD="$CANARY_KEY_PASSWORD"
}

assert_canaries_absent() {
  local log="$1"
  assert_log_excludes "$log" "$CANARY_STORE_PASSWORD"
  assert_log_excludes "$log" "$CANARY_KEY_PASSWORD"
  assert_log_excludes "$log" "$CANARY_ALIAS"
  assert_log_excludes "$log" "$CANARY_PATH"
}

# 5. Every individually absent input must remain a hard failure without leaking supplied values.
for missing in "${INPUT_NAMES[@]}"; do
  set_canary_inputs
  unset "$missing"
  LOG="$(expect_gradle_failure "missing-${missing}" ./gradlew :app:tasks -Popenband.android.signingMode=production)"
  grep -Fq "$missing" "$LOG" || fail "missing input ${missing} was not identified"
  assert_canaries_absent "$LOG"
done

# 6. Empty strings are missing inputs, not a downgrade signal.
for empty_input in "${INPUT_NAMES[@]}"; do
  set_canary_inputs
  export "$empty_input="
  LOG="$(expect_gradle_failure "empty-${empty_input}" ./gradlew :app:tasks -Popenband.android.signingMode=production)"
  grep -Fq "$empty_input" "$LOG" || fail "empty input ${empty_input} was not identified"
  assert_canaries_absent "$LOG"
done

# 7. Complete but nonexistent keystore must fail with a sanitized reason.
set_canary_inputs
BAD_KEYSTORE_LOG="$(expect_gradle_failure bad-keystore ./gradlew :app:tasks -Popenband.android.signingMode=production)"
grep -Fq "keystore is unavailable or unreadable" "$BAD_KEYSTORE_LOG" || fail "bad-keystore policy message absent"
assert_canaries_absent "$BAD_KEYSTORE_LOG"

# 8. Create a one-run throwaway identity for invalid-alias and positive-path proof.
EPHEMERAL_PASSWORD="$(openssl rand -hex 24)"
EPHEMERAL_ALIAS="openband-ci-ephemeral"
EPHEMERAL_KEYSTORE="$TMP_ROOT/openband-ci-ephemeral.p12"
if [[ -n "${GITHUB_ACTIONS:-}" ]]; then
  echo "::add-mask::$EPHEMERAL_PASSWORD"
fi
keytool -genkeypair \
  -noprompt \
  -storetype PKCS12 \
  -keystore "$EPHEMERAL_KEYSTORE" \
  -storepass "$EPHEMERAL_PASSWORD" \
  -keypass "$EPHEMERAL_PASSWORD" \
  -alias "$EPHEMERAL_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 1 \
  -dname "CN=OpenBand CI, OU=Ephemeral, O=OpenBand, L=CI, ST=CI, C=US" \
  >/dev/null 2>&1

export OPENBAND_ANDROID_KEYSTORE_PATH="$EPHEMERAL_KEYSTORE"
export OPENBAND_ANDROID_KEYSTORE_PASSWORD="$EPHEMERAL_PASSWORD"
export OPENBAND_ANDROID_KEY_PASSWORD="$EPHEMERAL_PASSWORD"

# 9. A readable keystore with an invalid alias must fail rather than silently changing trust domain.
export OPENBAND_ANDROID_KEY_ALIAS="missing-ephemeral-alias"
INVALID_ALIAS_LOG="$(expect_gradle_failure invalid-alias ./gradlew assembleRelease -Popenband.android.signingMode=production)"
assert_log_excludes "$INVALID_ALIAS_LOG" "$EPHEMERAL_PASSWORD"

# 10. Complete ephemeral inputs must produce a verifiably signed test APK.
export OPENBAND_ANDROID_KEY_ALIAS="$EPHEMERAL_ALIAS"
rm -rf app/build/outputs/apk/release
POSITIVE_LOG="$TMP_ROOT/positive-production.log"
./gradlew assembleRelease -Popenband.android.signingMode=production >"$POSITIVE_LOG" 2>&1
assert_log_excludes "$POSITIVE_LOG" "$EPHEMERAL_PASSWORD"
SIGNED_APK="$(find_release_apk)"
[[ -n "$SIGNED_APK" ]] || fail "production-mode release APK was not produced"
"$APKSIGNER" verify "$SIGNED_APK" >/dev/null 2>&1 || fail "ephemeral production-mode APK is not signed"

# 11. Verification remains available after privileged material is removed.
unset OPENBAND_ANDROID_KEYSTORE_PATH OPENBAND_ANDROID_KEYSTORE_PASSWORD OPENBAND_ANDROID_KEY_ALIAS OPENBAND_ANDROID_KEY_PASSWORD
rm -rf app/build/outputs/apk/release
./gradlew assembleRelease >/dev/null
RECOVERY_APK="$(find_release_apk)"
[[ -n "$RECOVERY_APK" ]] || fail "verification release APK was not produced after privileged signing was disabled"
assert_unsigned_apk "$RECOVERY_APK"

echo "android-signing-boundary: PASS"
