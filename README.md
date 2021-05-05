This module contains a component which allows scanning for standard barcodes & QR codes.

The latest version can be included in your player from this location: -

```
https://files-manywho-com.s3.amazonaws.com/e1dbcceb-070c-4ce6-95b0-ba282aaf4f48/barcode.js
https://files-manywho-com.s3.amazonaws.com/e1dbcceb-070c-4ce6-95b0-ba282aaf4f48/barcode.css
```


## Functionality

Uses the camera on the device to scan for barcodes in various formats.

If there are multiple cameras then an array of buttone is shown to select a camera.

## Component Settings

width and height if specified control the component's dimensions - in pixels.


## Component Attributes

### classes

Like all components, adding a "classes" attribute will cause that string to be added to the base container's class value

### ScanFormats

Set the ScanFormats attribute to a comma separated string of barcode types to scan for.

Accepted values are: -

QR_CODE
CODE_128
CODE_39
UPC_EAN_EXTENSION
EAN_8
EAN_13
CODABAR
CODE_93
AZTEC
DATA_MATRIX
ITF
MAXICODE
PDF_417
RSS_14
RSS_EXPANDED
UPC_A
UPC_E

Ony add the ones you need as the bigger the number the slower scanning will be.

this does them all: - "QR_CODE, CODE_128, CODE_39, UPC_EAN_EXTENSION, EAN_8, EAN_13, CODABAR, CODE_93, AZTEC, DATA_MATRIX, ITF, MAXICODE, PDF_417, RSS_14, RSS_EXPANDED, UPC_A, UPC_E"

## Outcomes

3 outcomes will be used if defined: -

### OnAccept
This will trigger when a code is detected and the user presses the Accept button.
Optional
The outcome's label will be used for the accept button's label if defined.

### OnCancel
This will trigger when the user presses the cancel button.
Optional
The outcome's label will be used for the cancel button's label if defined

### OnDetect
This will trigger when a code is detected and bypasses the accept button mechanism.
Optional






