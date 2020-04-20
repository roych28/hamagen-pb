import WifiManager, { WiFiObject } from 'react-native-wifi-reborn';
import { NetworkInfo } from 'react-native-network-info';
// @ts-ignore
import { sha1 } from 'react-native-sha1';
import moment from 'moment';

import { IS_IOS } from '../constants/Constants';
import { WifiConfig,TimeRange,SickJSON,Exposure } from '../types';
import { WifiMacAddressDatabase } from '../database/Database';
import { onError } from './ErrorService';
import { checkMillisecondsDiff } from './Tracker';
// import sickPeopleJson from '../dummy/SickPeopleJson.json';
import dummyNetworks from '../dummy/dummyNetworks.json';

const wifiMacAddressDatabase = new WifiMacAddressDatabase();

export const queryWifiDB = async () => {
  const db = new WifiMacAddressDatabase();
  const rows = await db.listAllWifiRecords();
  return rows;
};

export const getWifiList = () => new Promise(async (resolve, reject) => {
  try {
    let wifiList = [];
    const connectedBssid = await NetworkInfo.getBSSID();
    const ts = moment().valueOf();

    if (IS_IOS) {
      const connectedSsid = await NetworkInfo.getSSID();
      if (connectedBssid) {
        const wifiConfig = {
          ssid: connectedSsid,
          bssid: connectedBssid,
          rssi: 0,
          startTime: ts,
          endTime: 0,
          connected: 1
        }
        resolve([wifiConfig]);
      }

      resolve([]);
    } else {
      WifiManager.loadWifiList(async (wifiObjects) => {
        wifiList = JSON.parse(wifiObjects).map((wifiObject:WiFiObject) => {
          return {
            ssid: wifiObject.SSID,
            bssid: wifiObject.BSSID,
            rssi: wifiObject.level,
            startTime: ts,
            endTime: 0,
            connected: wifiObject.BSSID === connectedBssid
          };
        })
        resolve(wifiList);
      }, (e) => {
        console.log('Cannot get current BSSID!', e);
        reject(e);
      });
    }
  } catch (e) {
    console.log('Cannot get current BSSID!', e);
    reject(e);
  }
});

export const updateWifiSignals = async ( wifiGroupId:string ) => {
  try {
    // Get current wifi networks within range(only the connected one on IOS)
    const currentWifiList: any = await getWifiList();
    if (!currentWifiList.length) {
      return 0;
    }
    // Extract(make new list of) just the BSSIDS of the networks
    const currentBssids:string[] = currentWifiList.map((wifiConfig:WifiConfig) => wifiConfig.bssid);

    // Get from database the user's wifi networks which don't have end time yet
    const previousInRangeBssids:string[] = await wifiMacAddressDatabase.fetchLastInRangeBssids();

    // Set end time to recently disappeared networks  
    const ts = moment().valueOf();

    for(const bssid of previousInRangeBssids) {
      // networks that need to end
      if (!currentBssids.includes(bssid)) {
        await wifiMacAddressDatabase.setEndTime(bssid,ts);
      }
      // networks that still are in range so should be ignored
      else {
        const index = currentWifiList.findIndex((wifiObject:WifiConfig) => wifiObject.bssid === bssid);
        currentWifiList.splice(index,1);
      }
    }

    // networks that need to be added
    for(const network of currentWifiList) {
      await wifiMacAddressDatabase.addWifiMacAddresses({ wifiConfig: network, wifiGroupId });
    } 

    return currentWifiList.length;
  }
  catch(error) {
    onError({ error });
  }
}

export const isWifiTimeOverlapping = (userRecord: WifiConfig, sickRecord: WifiConfig) => {
  // End time in the range
 const isOverlapping = 
    (userRecord.endTime > sickRecord.startTime
      && userRecord.endTime < sickRecord.endTime
      && checkMillisecondsDiff(
        userRecord.endTime,
        Math.max(sickRecord.startTime, userRecord.startTime),
      ))
    // in the range
    || (userRecord.startTime < sickRecord.startTime
      && userRecord.endTime > sickRecord.endTime
      && checkMillisecondsDiff(
        sickRecord.endTime,
        sickRecord.startTime,
      ))
    // Start time in the range
    || (userRecord.startTime > sickRecord.startTime
      && userRecord.startTime < sickRecord.endTime
      && checkMillisecondsDiff(
        Math.min(sickRecord.endTime, userRecord.endTime),
        userRecord.startTime,
      ))
    console.log(isOverlapping);
    return isOverlapping
};

//TODO: dummy insert test
const insertNetworksToFeatures = (sickPeopleJson:SickJSON) => {
  for(let i = 0; i < 5; i++) {
    if(sickPeopleJson.features[i]){
      sickPeopleJson.features[i].networks = dummyNetworks[i];
    }    
  }
}

export const checkWifiOverlapping = async (sickPeopleJson: SickJSON) => {
  //TESTING: Insert hardcoded networks to json remove !!!!!
  //insertNetworksToFeatures(sickPeopleJson);

  // Get list of sick people features that have the networks property
  const allSickPeopleNetworks = sickPeopleJson.features.filter(sickPersonFeature => 
    sickPersonFeature.hasOwnProperty('networks'));
    // .flatMap((sickPerson) => sickPerson.networks);
  const userRecords = await wifiMacAddressDatabase.listAllWifiRecords();

  const sickPeopleIntersected: Exposure[] = [];

  for(const sickRecord of allSickPeopleNetworks) {
    for (const network of sickRecord.networks) {
      for (const userRecord of userRecords) {
        if (network.bssid === userRecord.bssid && isWifiTimeOverlapping(userRecord,network)) {
          sickRecord.properties.fromTime_utc = userRecord.startTime;
          sickRecord.properties.toTime_utc = userRecord.endTime;
          sickPeopleIntersected.push(sickRecord);
        } 
      }
    }
  }
  
  console.log('SICK PEOPLE INTERSECTED:',sickPeopleIntersected);
  return sickPeopleIntersected;
}
  
// const orderListOfMacAddresses = (list: any) => {
//   return list.sort((a: any, b: any) => a.BSSID.localeCompare(b.BSSID));
// };
