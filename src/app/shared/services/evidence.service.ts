import { Injectable } from '@angular/core';

@Injectable()
export class EvidenceService {
    
    private evidenceID: string;
    private areaID: string;
    private dimensionID: string;
    private userID: string;
    private activeVersion: string;

    public setEvidenceID(ID: string) {
        this.evidenceID = ID;
    }

    public setAreaID(ID: string) {
        this.areaID = ID;
    }

    public setDimensionID(ID: string) {
        this.dimensionID = ID;
        console.log("Dimension ID set in evidence service");
        console.log(this.dimensionID);
    }

    public setActiveVersion(version: string) {
        this.activeVersion = version;
        console.log("Evidence ID set in evidence service");
        console.log(this.evidenceID);
    }

    public setUserID(ID: string) {
        this.userID = ID;
    }

    public getEvidenceID(): string {
        return this.evidenceID;
    }

    public getEvidenceData(evidenceDescription: string, evidenceText: string ): string {
        let evidenceData: any = {
            "evidenceData": [{
            "areaID": this.areaID,
            "dimensionID": this.dimensionID,
            "statementID": "1.1.1",
            "evidenceDescription": evidenceDescription,
            "evidenceText": evidenceText,
            "version": this.activeVersion,
            "updatedBy": this.userID,
            "evidenceID": "",
        }]
        }

        return JSON.stringify(evidenceData);
    }

    public getUpdateEvidenceData(areaID, dimensionID, evidenceDescription: string, evidenceText: string, version, userID, evidenceID ) {
        let evidenceData: any = {
            "evidenceData": [{
            "areaID": areaID,
            "dimensionID": dimensionID,
            "statementID": "1.1.1",
            "evidenceDescription": evidenceDescription,
            "evidenceText": evidenceText,
            "version": version,
            "updatedBy": userID,
            "evidenceID": evidenceID,
        }]
        }

        return JSON.stringify(evidenceData);
    }

    
}