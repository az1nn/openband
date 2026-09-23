const raw = process.env.OPENBAND_CI_EVIDENCE;

if (!raw) {
  process.stderr.write("Merge Gate: BLOCKED (OPENBAND_CI_EVIDENCE missing)\n");
  process.exitCode = 1;
} else {
  let evidence;
  try {
    evidence = JSON.parse(raw);
  } catch (error) {
    process.stderr.write(`Merge Gate: BLOCKED (invalid evidence JSON: ${error.message})\n`);
    process.exitCode = 1;
  }

  if (evidence) {
    const rows = Object.entries(evidence).map(([name, value]) => ({
      name,
      result: value?.result ?? "missing",
    }));
    const blocked = rows.filter(({ result }) => result !== "success");

    for (const { name, result } of rows) process.stdout.write(`${name}: ${result}\n`);

    if (blocked.length > 0) {
      process.stderr.write(
        `Merge Gate: BLOCKED (${blocked.map(({ name, result }) => `${name}=${result}`).join(", ")})\n`
      );
      process.exitCode = 1;
    } else {
      process.stdout.write("Merge Gate core evidence: PASS\n");
    }
  }
}
