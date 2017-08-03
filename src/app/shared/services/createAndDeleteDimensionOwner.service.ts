import { Injectable } from '@angular/core';

@Injectable()
export class CreateAndDeleteDimensionOwnerService {
    
    private areaID: string;
    private dimensionID: string;
    private dimensionOwnerID: string;
    private activeVersion: string;

    public setAreaAndDimensionID(areaID: string, dimensionID: string): void {
        this.areaID = areaID;
        this.dimensionID = dimensionID;

        console.log("From Create and Delete Dimension Owner Service");
        console.log(this.areaID);
        console.log(this.dimensionID);
    }

    public setDimensionOwnerID(ownerID: string) {
        this.dimensionOwnerID = ownerID;
          console.log("From Create and Delete Dimension Owner Service - DIMENSION OWNER ID");
          console.log(this.dimensionOwnerID);
    }

    public getAreaID(): string {
        return this.areaID;
    }

    public getDimensionID(): string {
        return this.dimensionID;
    }

    public setActiveVersion(activeVersion: string): void {
        this.activeVersion = activeVersion;
    }

    public getDimensionOwnerID(): string {
        return this.dimensionOwnerID;
    }

    public retrieveA0ProfileKeys(): any {
        return localStorage.getItem('userProfile');
    }

    public getOwnerData() {

        let ownerData = this.retrieveA0ProfileKeys();

        let owner: any = {
            "ownerData": [{
            "areaID": this.areaID,
            "dimensionID": this.dimensionID,
            "ownerData": ownerData,
            "ownerType": "primaryOwner",
            "version": this.activeVersion,
            "dimensionOwnerID": this.dimensionOwnerID,
        }]
        }


        return JSON.stringify(owner);
    }
}