import config from '../config/config';
import * as WifiService from './WifiService';
import * as db from '../database/Database';
import * as constants from '../constants/Constants';
import { WifiConfig,TimeRange } from '../types';
import sickPeopleJson from '../dummy/SickPeopleJson.json';

const userWifiNetworks = [
    {
        ssid: 'Arcaffe',
        bssid: '68:ff:7b:1c:dc:be',
        rssi: -42,
        startTime: 1586710848890,
        endTime: 1586716033026,
        connected: 1
    },
    {
        ssid: 'Mcdonalds',
        bssid: '78:32:1b:d9:95:87',
        rssi: -48,
        startTime: 1586710848892,
        endTime: 1586716033028,
        connected: 0
    },
    {
        ssid: 'Shmuel',
        bssid: 'c4:12:f5:fc:02:e2',
        rssi: -58,
        startTime: 1586710848890,
        endTime: 1586716033026,
        connected: 0
    },
    {
        ssid: 'May',
        bssid: '68:ff:7b:1c:dc:3a',
        rssi: -70,
        startTime: 1586711796321,
        endTime: 1586713470343,
        connected: 0
    },
]

const userEncountersTimes = {
    '68:ff:7b:1c:dc:3a': { startTime: 1586711796321, endTime: 1586713470343},
    'c4:12:f5:fc:02:e2': { startTime: 1586710848890, endTime: 1586716033026},
    '78:32:1b:d9:95:87': { startTime: 1586710848892, endTime: 1586716033028}
}

const sickPeopleWithNetworks = sickPeopleJson.features.filter((sickPersonFeature:any) => sickPersonFeature.hasOwnProperty('networks')).flatMap(((sickPerson) => sickPerson.networks));

describe('Wifi', () => {
    // ====================================
    //  Check all WifiOverlapping Scenario
    // ====================================

    const userEncountersTimes = {
        '68:ff:7b:1c:dc:3a': { startTime: 1586711796321, endTime: 1586713470343},
        'c4:12:f5:fc:02:e2': { startTime: 1586710848890, endTime: 1586716033026},
        '78:32:1b:d9:95:87': { startTime: 1586710848892, endTime: 1586716033028},
        '3c:17:10:19:da:67': { startTime: 1586710848790, endTime: 1586710848800 },
        '54:64:d9:5e:48:ef': { startTime: 1586711796321, endTime: 1586716033026 }
    }

    const sickEncountersTimes = {
        '68:ff:7b:1c:dc:3b': { startTime: 1586711796361, endTime: 1586713470389},
        '68:ff:7b:1c:dc:be': { startTime: 1586711796391, endTime: 1586713470382},
        '68:ff:7b:1c:dc:3a': { startTime: 1586711796322, endTime: 1586713470342},
        '3c:17:10:19:da:67': { startTime: 1586710848890, endTime: 1586710848990 },
        '54:64:d9:5e:48:ef': { startTime: 1586711796221, endTime: 1586711796281 }
    }

    test('isWifiTimeOverlapping()',async () => {
        // Check overlappings time ranges
        expect(
            WifiService.isWifiTimeOverlapping(
                userEncountersTimes['68:ff:7b:1c:dc:3a'],
                sickEncountersTimes['68:ff:7b:1c:dc:3a']
                ),
        ).toBe(true);
        
        // Check not overlapping time ranges(user before sick person)
        expect(
            WifiService.isWifiTimeOverlapping(
                userEncountersTimes['3c:17:10:19:da:67'],
                sickEncountersTimes['3c:17:10:19:da:67']
                ),
        ).toBe(false);
        
        // Check not overlapping time ranges(user after sick person)
        expect(
            WifiService.isWifiTimeOverlapping(
                userEncountersTimes['54:64:d9:5e:48:ef'],
                sickEncountersTimes['54:64:d9:5e:48:ef']
                ),
        ).toBe(false);
    });

    test('getWifiList()', async () => {
        expect((WifiService.getWifiList()).resolves.length).toBeGreaterThan(0);
    })

    test('queryWifiDB()', async () => {
        const userWifiDB = new db.WifiMacAddressDatabase();
        const rows = ['data1', 'data2', 'data3'];
        userWifiDB.listAllWifiRecords.mockReturnValueOnce(Promise.resolve(rows));
        await expect(WifiService.queryWifiDB()).resolves.toEqual(rows);
      });
})
