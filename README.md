This module contains a component which allows scanning for standard barcodes.

The latest version can be included in your player from this location: -

```
https://files-manywho-com.s3.amazonaws.com/e1dbcceb-070c-4ce6-95b0-ba282aaf4f48/barcode.js
https://files-manywho-com.s3.amazonaws.com/e1dbcceb-070c-4ce6-95b0-ba282aaf4f48/barcode.css
```


## Functionality

Uses the camera on the device to scan for barcodes in various formats.

## Component Settings

width and height if specified control the component's dimensions - in pixels.


## Component Attributes

### classes

Like all components, adding a "classes" attribute will cause that string to be added to the base container's class value

### ScanFormats

Set the ScanFormats attribute to a comma separated string of barcode types to scan for.

Accepted values are: -
ean_reader
code_128_reader
ean_8_reader
code_39_reader
code_39_vin_reader
codabar_reader
upc_reader
upc_e_reader
i2of5_reader
2of5_reader

Ony add the ones you need as the bigger the number the slower scanning will be.

If ommitted then it defaults to just ean_reader







