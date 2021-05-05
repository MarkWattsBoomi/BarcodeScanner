const Quagga = require('quagga');
import { eContentType, FlowComponent, FlowObjectData, FlowObjectDataProperty } from 'flow-component-model';
import * as React from 'react';

declare const manywho: any;

class BarcodeScanner extends FlowComponent {

    video: any;
    code: string;
    type: string;
    scanning: boolean = false;
    identifySuccess: boolean = false;

    scanCodes: string[] = [];

    constructor(props: any) {
        super(props);
        this.onBarCodeRead = this.onBarCodeRead.bind(this);
        this.startScan = this.startScan.bind(this);
        this.acceptResult = this.acceptResult.bind(this);
    }

    async componentDidMount() {
        await super.componentDidMount();
        const video = this.video;
        const self = this;
        let formats: string[] = this.getAttribute("ScanFormats","ean_reader").split(",");
        formats.forEach((format: string) => {this.scanCodes.push(format.trim())});
        

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video :  {facingMode: 'environment'}})
            .then(function(stream: any) {
                video.srcObject = stream;
                video.play();
                self.startScan();
            });
        } else {

        }
    }

    async acceptResult() {
        const acceptOutcome: string = this.getAttribute('acceptOutcome', 'accept');
        if (this.outcomes["OnAccept"]) {
            await this.triggerOutcome("OnAccept");
        }
    }

    startScan() {
        this.code = '';
        this.type = '';
        this.forceUpdate();
        const video = this.video;
        const self = this;
        this.identifySuccess = false;
        Quagga.init(
            {
                halfSample: false,
                numOfWorkers: 0,
                debug: {
                    showCanvas: true,
                    drawBoundingBox: true,
                    showFrequency: true,
                    drawScanline: true,
                    showPattern: true,
                },
                inputStream: {
                    name: 'live',
                    type: 'LiveStream',
                    target: video,
                },
                decoder: {
                    readers: this.scanCodes,
                },
            },
            function(err: any) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    self.scanning = true;
                    console.log('reading');
                    self.forceUpdate();
                    Quagga.onDetected(self.onBarCodeRead);
                    Quagga.start();
                }
            },
            );
    }

    onBarCodeRead = (data: any) => {
        this.code = data.codeResult.code;
        this.setStateValue(this.code);
        this.identifySuccess = true;
        Quagga.stop();
        this.scanning = false;
        this.forceUpdate();
    }


    render() {
        const text: string = this.getAttribute('title', '&copy; Boomi Flow - 2019');
        let control: any;
        let result: any;

        if (this.scanning === true) {
            control = (
                <div className="barcode-scanner-control-box">
                    <span className="barcode-scanner-message">scanning</span>
                    </div>
            );
        }
        
        let actionButton: any;
        if (this.identifySuccess === true) {
            actionButton = (
                <button className="barcode-scanner-button" onClick={this.acceptResult}>Accept</button>
            );
        } 

        if (this.code  && this.code.length > 0) {
            result = (
            <div className="barcode-scanner-result-box">
                <div className="barcode-scanner-result-box-client">
                    <div className="barcode-scanner-result-row">
                        <span className="barcode-scanner-result">{this.code}</span>
                    </div>
                    <div className="barcode-scanner-result-row">
                        <span className="barcode-scanner-button-bar">
                            <button className="barcode-scanner-button" onClick={this.startScan}>Scan</button>
                            {actionButton}
                        </span>
                    </div>
                </div>
            </div>
            );
        }
        return (
            <div className="barcode-scanner">
                <video ref={(me: any) => {this.video = me; }} className="barcode-scanner-canvas" autoPlay={true}>
                </video>
                {control}
                {result}
            </div>
                );
    }

}

manywho.component.register('BarcodeScanner', BarcodeScanner);

export default BarcodeScanner;
