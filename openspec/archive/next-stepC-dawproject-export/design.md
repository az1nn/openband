# Next Step C: Open-Standard .dawproject Export — Design

## Architecture
- **`src/lib/dawprojectExport.ts`**: Converts OpenBand project state into the XML specification defined by Bitwig/Presonus `.dawproject` open format.
- **Archive Generation**: ZIP packaging using JSZip or native binary stream builders.
- **UI Integration**: Add `.dawproject` option in `BounceDialog.tsx`.
