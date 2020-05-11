/*
==========================================================================

 * Created by tim on 8/28/19.
 
 
 ==========================================================================
noaaDataTypes in noaa-cdo

Author:   Tim Erickson

Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==========================================================================

*/
let defaultDataTypes = ["TMAX", "TMIN"];

let dataTypes = {
    "TMAX": {
        "name": "tMax",
        "units" : "°C",
        "description": "Maximum temperature",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
    },

    "TMIN": {
        "name": "tMin",
        "units" : "°C",
        "description": "Minimum temperature",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
    },

    "TAVG": {
        "name": "tAvg",
        "units" : "°C",
        "description": "Average temperature",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
    },

    "PRCP": {
        "name": "precip",
        "units" : "mm",
        "description": "Precipitation",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
    },

    "SNOW": {
        "name": "snow",
        "units" : "mm",
        "description": "Snowfall",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
    },

    /**
     * Average (daily|monthly) wind speed in 0.1 m/s
     */
    "AWND": {
        "name": "avgWind",
        "units" : "m/s",
        "description": "Average windspeed",
        "decode": {
            "GHCND": function (v) {
                return v/10;
            },
            "GSOM": function (v) {
                return v/10;
            }
        },
    },

    /*
            "EVAP": {
                "name": "evap",
                "units" : "mm",
                "description": "Evaporation of water from the evaporation pan",
                "decode": {
                    "GHCND": function (v) {
                        return v;
                    },
                    "GSOM": function (v) {
                        return v;
                    }
                },
            },
            8?
/* Datatypes for global-summary-of-the-day dataset
    "DEWP": {
        "id": "DEWP",
        "name": "dewPoint",
        "description": "Average Dew Point",
        "scaleFactor": 1,
        "searchWeight": 1,
        "units": "fahrenheit"
    },
    "FRSHTT": {
        "id": "FRSHTT",
        "name": "indc",
        "description": "Indicators",
        "searchWeight": 1
    },
    "GUST": {
        "id": "GUST",
        "name": "gust",
        "description": "Maximum Wind Gust",
        "metricOutputPrecision": 1,
        "metricOutputUnits": "meters per second",
        "scaleFactor": 1,
        "searchWeight": 1,
        "standardOutputPrecision": 1,
        "standardOutputUnits": "knots",
        "units": "knots"
    },
    "MAX": {
        "id": "MAX",
        "name": "tMax",
        "description": "Maximum Temperature",
        "scaleFactor": 1,
        "searchWeight": 1,
        "units": "fahrenheit"
    },
    "MIN": {
        "id": "MIN",
        "name": "tMin",
        "description": "Minimum Temperature",
        "scaleFactor": 1,
        "searchWeight": 1,
        "units": "fahrenheit"
    },
    "MXSPD": {
        "id": "MXSPD",
        "name": "mxWind",
        "description": "Maximum Sustained Wind Speed",
        "metricOutputPrecision": 1,
        "metricOutputUnits": "meters per second",
        "scaleFactor": 1,
        "searchWeight": 1,
        "standardOutputPrecision": 1,
        "standardOutputUnits": "knots",
        "units": "knots"
    },
    "PRCP": {
        "id": "PRCP",
        "name": "precip",
        "description": "Precipitation",
        "scaleFactor": 1,
        "searchWeight": 1,
        "units": "inches"
    },
    "SLP": {
        "id": "SLP",
        "name": "pSeaLvl",
        "description": "Average Sea Level Pressure",
        "metricOutputPrecision": 2,
        "metricOutputUnits": "hectopascals",
        "scaleFactor": 1,
        "searchWeight": 1,
        "standardOutputPrecision": 2,
        "standardOutputUnits": "inches mercury",
        "units": "hectopascals"
    },
    "SNDP": {
        "id": "SNDP",
        "name": "snow",
        "description": "Snow Depth",
        "scaleFactor": 1,
        "searchWeight": 1,
        "units": "inches"
    },
    "STP": {
        "id": "STP",
        "name": "pStn",
        "description": "Average Station Pressure",
        "metricOutputPrecision": 2,
        "metricOutputUnits": "hectopascals",
        "scaleFactor": 1,
        "searchWeight": 1,
        "standardOutputPrecision": 2,
        "standardOutputUnits": "inches mercury",
        "units": "hectopascals"
    },

    "TEMP": {
        "id": "TEMP",
        "name": "temp",
        "description": "Average Temperature",
        "scaleFactor": 1,
        "searchWeight": 1,
        "units": "fahrenheit"
    },
    "VISIB": {
        "id": "VISIB",
        "name": "vis",
        "description": "Average Visibility",
        "scaleFactor": 1,
        "searchWeight": 1,
        "units": "miles"
    },
    "WDSP": {
        "id": "WDSP",
        "name": "aveWind",
        "description": "Average Wind Speed",
        "metricOutputPrecision": 1,
        "metricOutputUnits": "meters per second",
        "scaleFactor": 1,
        "searchWeight": 1,
        "standardOutputPrecision": 1,
        "standardOutputUnits": "knots",
        "units": "knots"
    }
*/
};

// All remotely current dataType ids.
// From this query:
// curl -H token:myToken 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?limit=1000&startdate=2011-01-01' | jq '[.results[].id]'
let dataTypeIDs = [
    "ALL",
    "AWND",
    "CDSD",
    "CLDD",
    "DAA",
    "DAEV",
    "DAPR",
    "DASF",
    "DATN",
    "DATX",
    "DHR",
    "DOD",
    "DP01",
    "DP05",
    "DP10",
    "DPA",
    "DPNP",
    "DPNT",
    "DPR",
    "DSD",
    "DSND",
    "DSNW",
    "DSP",
    "DT00",
    "DT32",
    "DT70",
    "DT90",
    "DTA",
    "DVL",
    "DWPR",
    "DX32",
    "DX70",
    "DX90",
    "EET",
    "EMNT",
    "EMSD",
    "EMSN",
    "EMXP",
    "EMXT",
    "EVAP",
    "FMTM",
    "FTM",
    "FZF0",
    "FZF1",
    "FZF2",
    "FZF3",
    "FZF4",
    "FZF5",
    "FZF6",
    "FZF7",
    "FZF8",
    "FZF9",
    "GSM",
    "HDSD",
    "HHC",
    "HN01",
    "HN02",
    "HN0299",
    "HN03",
    "HN04",
    "HN05",
    "HN06",
    "HN07",
    "HN08",
    "HN1299",
    "HN1399",
    "HN1499",
    "HN3199",
    "HN3299",
    "HN3399",
    "HN3499",
    "HN3599",
    "HN3699",
    "HN5199",
    "HN5299",
    "HN5399",
    "HN5499",
    "HN5599",
    "HN5699",
    "HPCP",
    "HSNW",
    "HTDD",
    "HTMN",
    "HTMX",
    "HX01",
    "HX02",
    "HX0299",
    "HX03",
    "HX04",
    "HX05",
    "HX06",
    "HX07",
    "HX08",
    "HX1299",
    "HX1399",
    "HX1499",
    "HX1599",
    "HX1799",
    "HX3199",
    "HX3299",
    "HX3399",
    "HX3499",
    "HX3599",
    "HX3699",
    "HX5199",
    "HX5299",
    "HX5399",
    "HX5499",
    "HX5599",
    "HX5699",
    "LN01",
    "LN02",
    "LN0299",
    "LN03",
    "LN04",
    "LN05",
    "LN06",
    "LN07",
    "LN08",
    "LN1299",
    "LN1399",
    "LN1499",
    "LN3199",
    "LN3299",
    "LN3399",
    "LN3499",
    "LN3599",
    "LN3699",
    "LN5199",
    "LN5299",
    "LN5399",
    "LN5499",
    "LN5599",
    "LN5699",
    "LTMN",
    "LTMX",
    "LX01",
    "LX02",
    "LX0299",
    "LX03",
    "LX04",
    "LX05",
    "LX06",
    "LX07",
    "LX08",
    "LX1299",
    "LX1399",
    "LX1499",
    "LX1599",
    "LX1799",
    "LX3199",
    "LX3299",
    "LX3399",
    "LX3499",
    "LX3599",
    "LX3699",
    "LX5199",
    "LX5299",
    "LX5399",
    "LX5499",
    "LX5599",
    "LX5699",
    "MDPR",
    "MDSF",
    "MDTN",
    "MDTX",
    "MMNP",
    "MMNT",
    "MMXP",
    "MMXT",
    "MN01",
    "MN02",
    "MN0299",
    "MN03",
    "MN04",
    "MN05",
    "MN06",
    "MN07",
    "MN08",
    "MN1299",
    "MN1399",
    "MN1499",
    "MN3199",
    "MN3299",
    "MN3399",
    "MN3499",
    "MN3599",
    "MN3699",
    "MN5199",
    "MN5299",
    "MN5399",
    "MN5499",
    "MN5599",
    "MN5699",
    "MNPN",
    "MNTM",
    "MX01",
    "MX02",
    "MX0299",
    "MX03",
    "MX04",
    "MX05",
    "MX06",
    "MX07",
    "MX08",
    "MX1299",
    "MX1399",
    "MX1499",
    "MX1599",
    "MX1799",
    "MX3199",
    "MX3299",
    "MX3399",
    "MX3499",
    "MX3599",
    "MX3699",
    "MX5199",
    "MX5299",
    "MX5399",
    "MX5499",
    "MX5599",
    "MX5699",
    "MXPN",
    "MXSD",
    "N0C",
    "N0H",
    "N0K",
    "N0Q",
    "N0R",
    "N0S",
    "N0V",
    "N0W",
    "N0X",
    "N0Z",
    "N1C",
    "N1H",
    "N1K",
    "N1P",
    "N1Q",
    "N1R",
    "N1S",
    "N1V",
    "N1X",
    "N2C",
    "N2H",
    "N2K",
    "N2Q",
    "N2R",
    "N2S",
    "N2V",
    "N2X",
    "N3C",
    "N3H",
    "N3K",
    "N3P",
    "N3Q",
    "N3R",
    "N3S",
    "N3V",
    "N3X",
    "NAC",
    "NAH",
    "NAK",
    "NAQ",
    "NAX",
    "NBC",
    "NBH",
    "NBK",
    "NBQ",
    "NBX",
    "NCR",
    "NCZ",
    "NET",
    "NHI",
    "NHL",
    "NLL",
    "NMD",
    "NME",
    "NML",
    "NSP",
    "NSS",
    "NST",
    "NSW",
    "NTP",
    "NTV",
    "NVL",
    "OHA",
    "PGTM",
    "PRCP",
    "PSUN",
    "PTA",
    "QGAG",
    "QPCP",
    "RCM",
    "RSL",
    "SN02",
    "SN11",
    "SN12",
    "SN13",
    "SN14",
    "SN31",
    "SN32",
    "SN33",
    "SN34",
    "SN35",
    "SN36",
    "SN51",
    "SN52",
    "SN53",
    "SN54",
    "SN55",
    "SN56",
    "SN57",
    "SNOW",
    "SNWD",
    "SPD",
    "SX02",
    "SX11",
    "SX12",
    "SX13",
    "SX14",
    "SX15",
    "SX17",
    "SX31",
    "SX32",
    "SX33",
    "SX34",
    "SX35",
    "SX36",
    "SX51",
    "SX52",
    "SX53",
    "SX54",
    "SX55",
    "SX56",
    "SX57",
    "TAVG",
    "TEVP",
    "THIC",
    "TMAX",
    "TMIN",
    "TOBS",
    "TPCP",
    "TR0",
    "TR1",
    "TR2",
    "TSNW",
    "TSUN",
    "TV0",
    "TV1",
    "TV2",
    "TWND",
    "TZL",
    "WDF2",
    "WDF5",
    "WDFG",
    "WDMV",
    "WESD",
    "WESF",
    "WSF2",
    "WSF5",
    "WSFG",
    "WSFI",
    "WT01",
    "WT02",
    "WT03",
    "WT04",
    "WT05",
    "WT06",
    "WT07",
    "WT08",
    "WT09",
    "WT10",
    "WT11",
    "WT13",
    "WT14",
    "WT15",
    "WT16",
    "WT17",
    "WT18",
    "WT19",
    "WT21",
    "WT22"
];

export {defaultDataTypes, dataTypes, dataTypeIDs};
