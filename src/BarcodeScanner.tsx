
import * as React from 'react';
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType, Result } from '@zxing/library';

declare const manywho: any;

enum eScanStatus {
    init,
    scanning,
    paused,
    detected,
}

class BarcodeScanner extends React.Component<any,any> {

    reader: BrowserMultiFormatReader;
    video: any;
    stream: MediaStream;
    code: string;
    type: string;
    scanStat: eScanStatus;
    identifySuccess: boolean = false;

    acceptLabel: string = "Accept";
    cancelLabel: string = "Cancel";
    
    outcomes: Map<string,any> = new Map();
    attributes: Map<string,string> = new Map();

    scanCodes: BarcodeFormat[] = [];

    deviceIds: any = {};
    selectedDeviceId: string = "";

    cameras: any[];

    constructor(props: any) {
        super(props);
        this.startScan = this.startScan.bind(this);
        this.acceptResult = this.acceptResult.bind(this);
        this.scanStat = eScanStatus.init;
        this.stopScan = this.stopScan.bind(this);
        this.cancel = this.cancel.bind(this);
        this.switchCamera = this.switchCamera.bind(this);
        this.buildCameras = this.buildCameras.bind(this);

        let model: any = manywho.model.getComponent(this.props.id, this.props.flowKey);
        Object.keys(model.attributes).forEach((key: string) => {
            this.attributes.set(key,model.attributes[key]);
        });
        const outcomes = manywho.model.getOutcomes(this.props.id, this.props.flowKey);
        outcomes.forEach((outcome: any) => {
            this.outcomes.set(outcome.developerName,outcome);
        });
       

        if(this.attributes.has("ScanFormats")) {
            let formats: string[] = this.attributes.get("ScanFormats").split(",");
            formats.forEach((format: string) => {
                switch(format) {
                    case "QR_CODE":
                        this.scanCodes.push(BarcodeFormat.QR_CODE);
                        break;
                    case "CODE_128":
                        this.scanCodes.push(BarcodeFormat.CODE_128);
                        break;
                    case "CODE_39":
                        this.scanCodes.push(BarcodeFormat.CODE_39);
                        break;
                    case "UPC_EAN_EXTENSION":
                        this.scanCodes.push(BarcodeFormat.UPC_EAN_EXTENSION);
                        break;
                    case "EAN_8":
                        this.scanCodes.push(BarcodeFormat.EAN_8);
                        break;
                    case "EAN_13":
                        this.scanCodes.push(BarcodeFormat.EAN_13);
                        break;
                    case "CODABAR":
                        this.scanCodes.push(BarcodeFormat.CODABAR);
                        break;
                    case "CODE_93":
                        this.scanCodes.push(BarcodeFormat.CODE_93);
                        break;
                    case "AZTEC":
                        this.scanCodes.push(BarcodeFormat.AZTEC);
                        break;
                    case "DATA_MATRIX":
                        this.scanCodes.push(BarcodeFormat.DATA_MATRIX);
                        break;
                    case "ITF":
                        this.scanCodes.push(BarcodeFormat.ITF);
                        break;
                    case "MAXICODE":
                        this.scanCodes.push(BarcodeFormat.MAXICODE);
                        break;
                    case "PDF_417":
                        this.scanCodes.push(BarcodeFormat.PDF_417);
                        break;
                    case "RSS_14":
                        this.scanCodes.push(BarcodeFormat.RSS_14);
                        break;
                    case "RSS_EXPANDED":
                        this.scanCodes.push(BarcodeFormat.RSS_EXPANDED);
                        break;
                    case "UPC_A":
                        this.scanCodes.push(BarcodeFormat.UPC_A);
                        break;
                    case "UPC_E":
                        this.scanCodes.push(BarcodeFormat.UPC_E);
                        break;
                }
            });
        }
    }

    async componentDidMount() {
        
       
        const video = this.video;
        const self = this;
  
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, this.scanCodes);
        this.reader = new BrowserMultiFormatReader(hints);

        if(this.outcomes.has("OnAccept")) {
            this.acceptLabel = this.outcomes.get("OnAccept").label
        }

        if(this.outcomes.has("OnCancel")) {
            this.cancelLabel = this.outcomes.get("OnCancel").label
        }
     
        let devices = await navigator.mediaDevices.enumerateDevices(); 
        for (var i = 0; i !== devices.length; ++i) {
            var deviceInfo = devices[i];
            if (deviceInfo.kind === 'videoinput') {
                this.deviceIds[deviceInfo.deviceId] =  deviceInfo;
                if(this.selectedDeviceId === "") {
                    this.selectedDeviceId=deviceInfo.deviceId;
                }
            }
        }
        
        self.forceUpdate();
        await self.buildCameras();
        self.startScan();
        
    }

    async acceptResult() {
        
        if (this.outcomes.has("OnAccept")) {
            manywho.engine.move(this.outcomes.get("OnAccept"), this.props.flowKey);
        }
    }

    async startScan() {
        if (this.scanStat === eScanStatus.scanning) {
            console.log('already scanning - can\'t start');
            this.forceUpdate();
        }
        else {
  
            //const hints = new Map();
            //const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.EAN_8, BarcodeFormat.EAN_13];

            //hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

            //const reader = new MultiFormatReader();

            //this.reader.hints = hints;

            this.scanStat = eScanStatus.scanning;
            this.forceUpdate();
            let result: Result = await this.reader.decodeOnceFromVideoDevice(this.selectedDeviceId, this.video) //Once(this.video); //FromStream(this.stream, this.video);//  decodeOnce(this.video);
            this.reader.stopAsyncDecode();

            this.code = result.getText();

            //let state=manywho.state.getComponent(this.props.id, this.props.flowKey);
            let newState = { "contentValue": this.code };
            manywho.state.setComponent(this.props.id, newState, this.props.flowKey, true);
            //this.props.onChange(result);
            //this.props.onEvent();

            this.scanStat = eScanStatus.detected;
            this.forceUpdate();

            // if outcome detected trigger it
            if (this.outcomes.has("OnDetect")) {
                manywho.engine.move(this.outcomes.get("OnDetect"), this.props.flowKey);
            }
            
        }
    }

    async stopScan() {
        if (this.scanStat !== eScanStatus.scanning) {
            console.log('not scanning - can\'t stop');
            this.forceUpdate();
        } else {
            this.reader.stopAsyncDecode();
            this.scanStat = eScanStatus.paused;
            this.forceUpdate();
        }
    }

    async cancel() {
        await this.stopScan();
        if (this.outcomes.has("OnCancel")) {
            manywho.engine.move(this.outcomes.get("OnCancel"), this.props.flowKey);
        }
    }

    async switchCamera(deviceId: string) {
        await this.stopScan();
        this.selectedDeviceId = deviceId;
        await this.buildCameras();
        this.startScan();
    }

    async buildCameras() : Promise<any> {

        this.cameras=[];
        
        for(let deviceId of Object.keys(this.deviceIds)) {
            let style: React.CSSProperties = {
                width: "2rem",
                height: "2rem",
                backgroundColor: "transparent",
                border: "none",
                marginRight: "1rem",
                fontSize: "2rem"

            };
            if(this.selectedDeviceId === deviceId) {
                style.color="red"
            }
            
            this.cameras.push(
                
                <div
                    key={deviceId}
                    onClick={(e: any) => {this.switchCamera(deviceId)}}
                >
                    <span 
                        className="glyphicon glyphicon-camera" 
                        style={style}
                    /> 
                </div>
            );
        }
        
        return true;
    }

    render() {
        const text: string = this.attributes.has("Title")? this.attributes.get("Title") : "&copy; Boomi Flow - 2019";
        let control: any;
        let result: any;
        let message: string = "";

        const buttons: any = [];
        switch (this.scanStat) {
            case eScanStatus.init:
                message = 'Initialising';
                break;

            case eScanStatus.scanning:
                
                let cancelAction: any;
                if (this.outcomes.has("OnCancel")) {
                    cancelAction = this.cancel;
                }
                else {
                    cancelAction = this.stopScan;
                }
                
                message = 'Scanning';
                buttons.push(
                    <button
                        className="barcode-scanner-button"
                        onClick={cancelAction}
                    >
                        {this.cancelLabel}
                    </button>,
                );
                break;

            case eScanStatus.paused:
                message = 'Paused';
                buttons.push(
                    <button
                        className="barcode-scanner-button"
                        onClick={this.startScan}
                    >
                        Re-Scan
                    </button>,
                );
                break;

            case eScanStatus.detected:
                    message = 'Code Detected';
                    buttons.push(
                        <button
                            className="barcode-scanner-button"
                            onClick={this.startScan}
                        >
                            Re-Scan
                        </button>,
                    );
                    buttons.push(
                        <button
                            className="barcode-scanner-button"
                            onClick={this.acceptResult}
                        >
                            {this.acceptLabel}
                        </button>,
                    );
                    result = this.code;
                    break;
        }
        
        let offset: string = "4rem"; 
        if(result?.length > 0) {
            offset="7rem";
        }
        control = (
            <div
                style={{
                    position: 'absolute',
                    left: this.video?.clientLeft,
                    top: this.video?.clientTop,
                    height: this.video?.clientHeight,
                    width: this.video?.clientWidth,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexGrow: 0,
                    backgroundColor: '#000000',
                    height: "3rem"
                }}
            >
                <span
                    style={{
                        margin: 'auto',
                        fontFamily: 'tahoma',
                        color: '#fefefe',
                        fontSize: '1.4rem'
                    }}
                >
                    {message}
                </span>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexGrow: 0,
                    backgroundColor: '#000000'
                }}
            >
                <div
                    style={{
                        margin: 'auto',
                    }}
                >
                    <span
                        style={{
                            margin: 'auto',
                            fontFamily: 'tahoma',
                            color: '#fefefe',
                            fontSize: '2rem'
                        }}
                    >
                        {result}
                    </span>
                </div>

            </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexGrow: 1,
                    }}
                >
                    <div
                        style={{
                            margin: 'auto',
                        }}
                    >
                        {buttons}
                    </div>

                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexGrow: 1,
                        position: "absolute",
                        top: offset,
                        right: 0
                    }}
                >
                    {this.cameras}
                </div>

            </div>
        );

        return (
            <div className="barcode-scanner">
                <video 
                    ref={(me: any) => {this.video = me; }} 
                    className="barcode-scanner-canvas" 
                    autoPlay={true}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                    }}
                    
                />
                {control}
            </div>
        );
    }

}

manywho.component.register('BarcodeScanner', BarcodeScanner);

export default BarcodeScanner;
