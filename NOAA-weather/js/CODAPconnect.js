/*
==========================================================================

 * Created by tim on 8/22/19.
 
 
 ==========================================================================
CODAPconnect in noaa-cdo

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
/**
 * @type {{
 *   DSName, DSTitle, version, dimensions
 * }}
 */
let pluginProperties;
let myCODAPId = null;

/**
 * Initiates the connection to CODAP.
 * @param iPluginProperties {{}}
 * @return {Promise<boolean>} Whether connection was successful. If not, likely
 *    the component is not an IFrame in a CODAP instance.
 */
async function initialize(iPluginProperties) {
    pluginProperties = iPluginProperties;
    let result = {success: true};
    try {
        await codapInterface.init(getPluginDescriptor(pluginProperties), null);
        const tMessage = {
            "action": "update", "resource": "interactiveFrame", "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false,
            }
        };
        result = await codapInterface.sendRequest(tMessage);
    } catch (ex) {
        result.success= false;
        console.warn('Initialization of CODAP interface failed: ' + ex);
    }
    return result.success;
}

/**
 * Selects this component. In CODAP this will bring this component to the front.
 *
 * @return {Promise<void>}
 */
async function selectSelf() {
    console.log('select!');
    if (myCODAPId == null) {
        let r1 = await codapInterface.sendRequest({action: 'get', resource: 'interactiveFrame'});
        if (r1.success) {
            myCODAPId = r1.values.id;
        }
    }
    if (myCODAPId != null) {
        return await codapInterface.sendRequest({
            action: 'notify',
            resource: `component[${myCODAPId}]`,
            values: {request: 'select'
            }
        });
    }
}

async function getInteractiveState() {
    return codapInterface.getInteractiveState();
}

/**
 * Creates an attribute
 * @param datasetName {string}
 * @param collectionName {string}
 * @param dataType {object}
 * @param unitSystem {'metric'|'standard}
 * @return Promise of result
 */
function createAttribute(datasetName, collectionName, dataType, unitSystem) {
    return codapInterface.sendRequest({
        action: 'create',
        resource: 'dataContext[' + datasetName + '].collection[' + collectionName + '].attribute',
        values: {
            name: dataType.name,
            unit: dataType.units[unitSystem],
            description: dataType.description
        }
    })
}

function updateAttributeUnit(datasetDef, dataTypeName, unit) {
    let collection = datasetDef.collections.find(function (collection) {
        return collection.attrs.find(function (attr) {
            return attr.name === dataTypeName;
        });
    });
    let resource = `dataContext[${datasetDef.name}].collection[${collection.name}].attribute[${dataTypeName}]`;
    return codapInterface.sendRequest({
        action: 'update',
        resource: resource,
        values: {
            unit: unit
        }
    });
}

/**
 * Creates new attributes for any that do not already exist.
 * @param dataTypes {object}
 * @param unitSystem {'metric'|'standard'}
 * @return a Promise fulfilled when all attributes are created.
 */
async function updateDataset(dataTypes, unitSystem) {
    const getDatasetMsg = {
        action: 'get',
        resource: `dataContext[${pluginProperties.DSName}]`
    };
    let result = await codapInterface.sendRequest(getDatasetMsg);
    if (!result || !result.success) {
        result = await codapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: getNoaaDataContextSetupObject(pluginProperties)
        });
        if (result.success) {
            result = await codapInterface.sendRequest(getDatasetMsg);
        }
    }
    if (!result.success) {
        throw new Error('Could not find or create NOAA-Weather dataset');
    }
    const dataSetDef = result.values;
    const attrDefs = [];
    const dsName = pluginProperties.DSName;
    dataSetDef.collections.forEach(function (collection) {
        collection.attrs.forEach(function (attr) {
            attrDefs.push(attr);
        })
    });
    const lastCollection = dataSetDef.collections[dataSetDef.collections.length - 1];
    const promises = dataTypes.map(function (dataType) {
        const attrName = dataType.name;
        const attrDef = attrDefs.find(function (ad) {
            return ad.name === attrName;
        });
        if (!attrDef) {
            return createAttribute(dsName, lastCollection.name, dataType, unitSystem);
        } else {
            let unit = dataType.units[unitSystem];
            if (attrDef.unit !== unit) {
                return updateAttributeUnit(dataSetDef, attrName, unit);
            } else {
                return Promise.resolve('Unknown attribute.')
            }
        }
    });
    return Promise.all(promises);
}

async function hasDataset(name) {
    let result = await codapInterface.sendRequest({
        action: 'get',
        resource: `dataContext[${name}]`
    });
    return result.success === true;
}

async function createMap(name, dimensions, center, zoom) {
    let result = await codapInterface.sendRequest({
        action: 'create',
        resource: 'component',
        values: {
            type: 'map',
            name: name,
            dimensions: dimensions
        }
    });
    if (result.success) {
        setTimeout(function () {
            codapInterface.sendRequest({
                action: 'update',
                resource: `component[${name}]`,
                values: {
                    center: center,
                    zoom: 4
                }
            });
            setTimeout(function () {
                codapInterface.sendRequest({
                    action: 'update',
                    resource: `component[${name}]`,
                    values: {
                        zoom: zoom
                    }
                });

            }, 500)
        }, 2000);
    }
}

function centerAndZoomMap(mapName, center, zoom) {
    // noinspection JSIgnoredPromiseFromCall
    codapInterface.sendRequest({
        action: 'update',
        resource: `component[${mapName}]`,
        values: {
            center: center,
            zoom: zoom
        }
    });
}

/*
 * Whether the CODAP instance has an active Map Component.
 */
async function hasMap() {
    const componentsResult = await codapInterface.sendRequest({
        action: 'get',
        resource: 'componentList'
    });
    return componentsResult
        && componentsResult.success
        && componentsResult.values.find(function (component) {
            return component.type==="map";
        });
}

/**
 * Creates the weather station dataset in CODAP.
 * @param datasetName
 * @param collectionName
 * @param datasetName
 * @param collectionName
 * @param stations a list of station descriptor objects
 * @param selectionHandler called when a station is selected in the created
 * dataset. The station id is passed or null.
 * @return {Promise<void>}
 */
async function createStationsDataset(datasetName, collectionName, stations, selectionHandler) {
    let result = await codapInterface.sendRequest({
        action: 'create',
        resource: 'dataContext',
        values: {
            name: datasetName,
            label: datasetName,
            collections: [{
                name: collectionName,
                attrs: [
                    { name: 'name' },
                    { name: 'ICAO'},
                    { name: 'mindate', type: 'date' },
                    { name: 'maxdate', type: 'date'},
                    { name: 'latitude', unit: 'º'},
                    { name: 'longitude', unit: 'º' },
                    { name: 'elevation', unit: 'm'},
                    { name: 'isdID'},
                    { name: 'ghcndID'}
                ]
            }]
        }
    });
    if (!result.success) {
        console.log(`Dataset, "${datasetName}", creation failed`);
        return;
    }
    result = await codapInterface.sendRequest({
        action: 'create',
        resource: `dataContext[${datasetName}].item`,
        values: stations
    });
    return result;
}

function addNotificationHandler(action, resource, handler) {
    codapInterface.on(action, resource, handler);
}

/**
 * Tell CODAP to make items.
 * @param props
 * @param iValues   An array of objects containing the keys and values
 * corresponding to attributes and values of the new cases.
 * @param dataTypes An array of datatypes to be reference for creating attributes
 * @param unitSystem {'metric'|'standard'}
 */
async function createNOAAItems (props, iValues, dataTypes, unitSystem) {
    await updateDataset(dataTypes, unitSystem);

    iValues = pluginHelper.arrayify(iValues);
    console.log("noaa-cdo ... createNOAAItems with " + iValues.length + " case(s)");
    await pluginHelper.createItems(iValues, props.DSName); // no callback.

    //  also make the case table show up
    await codapInterface.sendRequest({
        "action": "create",
        "resource": "component",
        "values": {
            "type": "caseTable",
            "dataContext": props.DSName
        }
    });
}

// noinspection JSUnusedLocalSymbols
async function findStationByID(stationID) {
    const dsName = 'US-Weather-Stations';
    const collectionName = 'US Weather Stations';
    let reply = await codapInterface.sendRequest({
        action: 'get',
        resource: `dataContext[${dsName}].collection[${collectionName}].caseSearch[id==${stationID}]`
    })
    if (reply.success) {
        return reply.values;
    }
}

async function selectStations(stationNames) {
    if (!stationNames) {
        return;
    }
    const dsName = 'US-Weather-Stations';
    const collectionName = 'US Weather Stations';
    const req = stationNames.map(function (stationName) {
       return {
           action: 'get',
           resource: `dataContext[${dsName}].collection[${collectionName}].caseSearch[name==${stationName}]`
       }
    });
    const reply = await codapInterface.sendRequest(req);
    const selectionList = reply.filter(function (r) {
            return r && r.success;
        }).map(function (r) {
            return r.values[0].id;
        });
    await codapInterface.sendRequest({
        action: 'create',
        resource: `dataContext[${dsName}].selectionList`,
        values: selectionList
    });
}

/**
 * Returns a plugin descriptor object for creating connection to CODAP/
 * @param props: must have DSName, name of Weather dataset; DSTitle, title of
 * dataset; version, version string; and dimensions.
 * @return {{}}}
 */
function getPluginDescriptor(props) {
    return {
        name: props.DSName,
        title: props.DSTitle,
        version: props.version,
        dimensions: props.dimensions,      //      dimensions,
    }
}

/**
 * Returns a data context initialization object for NOAA weather information.
 * This is a two level hierarchy. Top level has data about the station.
 * Bottom level has weather data for a discrete time interval.
 * @param props: pluginConfiguration object. Must have DSName, name of dataset.
 * @return {{}}
 */
function getNoaaDataContextSetupObject(props) {
    return {
        name: props.DSName,
        title: props.DSName,
        description: "Data from NOAA",
        collections: [{
            name: props.DSName,
            labels: {
                singleCase: "station", pluralCase: "stations",
            },
            attrs: [
                {name: "where", type: 'categorical', description: "weather station"},
                {name: "latitude", type: 'numeric', description: "Latitude of weather station"},
                {name: "longitude", type: 'numeric', description: "Longitude of weather station"},
                {name: "elevation", type: 'numeric', description: "Elevation of weather station", unit: "meters"},
                {name: "report type", type: 'categorical', description: 'Daily summary or monthly summary'}
            ]
        },
        {
            name: "Observations",
            parent: props.DSName,
            labels: {
                singleCase: "observation",
                pluralCase: "observations",
                setOfCasesWithArticle: "a group of records"
            },
            attrs: [{name: "when", type: 'date', description: "what day"}]
        }]

    };
}

async function clearData (datasetName) {
    let result = await codapInterface.sendRequest({
        action: 'get', resource: `dataContext[${datasetName}]`
    });

    if (result.success) {
        let dc = result.values;
        let lastCollection = dc.collections[dc.collections.length-1];
        return await codapInterface.sendRequest({
            action: 'delete',
            resource: `dataContext[${datasetName}].collection[${lastCollection.name}].allCases`
        });
    } else {
        return Promise.resolve({success: true});
    }
}

/**
 * Removes attributes in the named dataset collection except those in the
 * exception list;
 * @param datasetName {string}
 * @param collectionName {string}
 * @param attributeNames {[string]}
 * @return {Promise}
 */
async function deleteAttributes(datasetName, collectionName, attributeNames) {
    let attrDeletePromises = attributeNames.map(function (attrName) {
        return codapInterface.sendRequest({
            action: 'delete',
            resource: `dataContext[${datasetName}].collection[${collectionName}].attribute[${attrName}]`
        })
    });
    return await Promise.allSettled(attrDeletePromises);
}

async function getAllItems(datasetName) {
    let result = await codapInterface.sendRequest({
        action: 'get', resource: `dataContext[${datasetName}]`
    });
    if (!result) {
        return [];
    }
    result = await codapInterface.sendRequest({
        action: 'get',
        resource: `dataContext[${datasetName}].itemSearch[*]`
    });
    if (result && result.success) {
        return result.values.map(function (item) {return item.values});
    }
}

async function queryCases(dataset, collection, query) {
    let resource = `dataContext[${dataset}].collection[${collection}].caseFormulaSearch[${query}]`;
    return codapInterface.sendRequest({
        action: 'get',
        resource: resource
    });
}

export {
    addNotificationHandler,
    centerAndZoomMap,
    clearData,
    createAttribute,
    createMap,
    createNOAAItems,
    createStationsDataset,
    deleteAttributes,
    getAllItems,
    getInteractiveState,
    hasDataset,
    hasMap,
    initialize,
    queryCases,
    selectSelf,
    selectStations
};
