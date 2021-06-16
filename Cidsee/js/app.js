// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2021 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================
// import {calendar} from './calendar.js';
import {STATE_POPULATION_DATA, COUNTY_POPULATION_DATA} from './data.js';

const APP_NAME = 'CDC COVID Data';

const DATASETS = [
  {
    id: 'StateData',
    name: 'CDC COVID State Data',
    documentation: 'https://data.cdc.gov/Case-Surveillance/United-States-COVID-19-Cases-and-Deaths-by-State-o/9mfq-cb36/data',
    endpoint: 'https://data.cdc.gov/resource/9mfq-cb36.json',
    apiToken: 'CYxytZqW1xHsoBvRkE7C74tUL',
    omittedAttributeNames: [
      'conf_cases',
      'conf_death',
      'consent_cases',
      'consent_deaths',
      'created_at',
      'pnew_case',
      'pnew_death',
      'prob_cases',
      'prob_death',
    ],
    additionalAttributes: [
      {
        name: 'new_cases_per_100000',
        formula: 'new_case*100000/population'
      },
      {
        name: 'new_deaths_per_100000',
        formula: 'new_death*100000/population'
      },
      {
        name: 'total_cases_per_100000',
        formula: 'tot_cases*100000/population'
      },
      {
        name: 'total_deaths_per_100000',
        formula: 'tot_death*100000/population'
      },
    ],
    overriddenAttributes: [
        {
          name: 'submission_date',
          type: 'date'
        }
    ],
    parentAttributes: ['state', 'population'],
    uiComponents: [
      {
        type: 'select',
        name: 'stateCode',
        apiName: 'state',
        label: 'Select State',
        lister: function () { return STATE_POPULATION_DATA.map(function (st) { return st["USPS Code"];})}
      }
    ],
    uiCreate: function (parentEl) {
      parentEl.append(createUIControl(this.uiComponents[0]));
    },
    makeURL: function () {
      let stateCode = document.querySelector(`#StateData [name=stateCode]`).value;
      if (stateCode && stateCode.length === 2) {
        return this.endpoint + `?state=${stateCode.toUpperCase()}`;
      } else {
        message('Please enter two character state code');
      }
    },
    preprocess: function (data) {
      data = mergePopulation(data, 'state', 'USPS Code');
      data = sortOnDateAttr(data, 'submission_date');
      return data;
    }
  },
  {
    id: 'DeathByCounty',
    name: 'CDC COVID Death Counts by County',
    endpoint: 'https://data.cdc.gov/resource/kn79-hsxy.json',
    apiToken: 'CYxytZqW1xHsoBvRkE7C74tUL',
    documentation: 'https://data.cdc.gov/NCHS/Provisional-COVID-19-Death-Counts-in-the-United-St/kn79-hsxy',
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
        'Data is cumulative not historical. One row per county.',
        createElement('br', [], []),
        createElement('label', null, [
          'Enter Two Char State Abbr: ',
          createElement('input', null, [
            createAttribute('type', 'text'),
            createAttribute('style', 'width: 2em;')
          ])
        ])
      ]));

    },
    makeURL: function () {
      let stateCode = document.querySelector(`#${this.id} input[type=text]`).value;
      let stateCodePhrase = stateCode? `State=${stateCode.toUpperCase()}&`: '';
      if (stateCode) {
        return this.endpoint + `?${stateCodePhrase}`;
      } else {
        message('Please enter two character state code');
      }
    }
  },
  {
    id: 'VaccinesHistorical',
    name: 'CDC COVID-19 Vaccinations in the United States, County',
    endpoint: 'https://data.cdc.gov/resource/8xkx-amqh.json',
    apiToken: 'CYxytZqW1xHsoBvRkE7C74tUL',
    documentation: 'https://data.cdc.gov/Vaccinations/COVID-19-Vaccinations-in-the-United-States-County/8xkx-amqh',
    parentAttributes: ['recip_state', 'recip_county', 'population'],
    omittedAttributeNames: [
        'fips',
        'mmwr_week',
        'completeness_pct'
    ],
    overriddenAttributes: [
      {
        name: 'date',
        type: 'date'
      }
    ],
    uiComponents: [
      {
        type: 'select',
        name: 'stateCode',
        apiName: 'state',
        label: 'Select State',
        lister: function () {
          return STATE_POPULATION_DATA.map(function (st) {
            return st["USPS Code"];
          });
        }
      },
      {
        type: 'select',
        name: 'countyName',
        apiName: 'county',
        label: 'Select County',
        dependsUpon: 'stateCode',
        default: 'AL',
        lister: function () { return []; },
        updater: function(parentEl, stateCode) {
          let el = parentEl.querySelector('[name=countyName]');
          let stateRecord = STATE_POPULATION_DATA.find(function (st) {return st["USPS Code"] === stateCode;});
          let stateName = stateRecord && stateRecord["State or territory"];
          let nameList = stateName? COUNTY_POPULATION_DATA
                .filter(function (item) {return item.STNAME === stateName && item.COUNTY !== "000";})
                .map(function (co) {return co.CTYNAME;})
              : [];
          el.innerHTML = '';
          nameList.forEach(function (name) {
            el.append(createElement('option', [], [name]));
          });
        },
      }
    ],
    uiCreate: function (parentEl) {
      let stateCtlDef = this.uiComponents[0];
      let countyCtlDef = this.uiComponents[1];
      let ctlState = createUIControl(stateCtlDef);
      let ctlCounty = createUIControl(countyCtlDef);
      parentEl.append(ctlState);
      parentEl.append(ctlCounty);
      countyCtlDef.updater(parentEl, 'AL');
      let stateInputEl = ctlState.querySelector('[name=stateCode]');
      if (stateInputEl) {
        stateInputEl.addEventListener('change', function (ev) {countyCtlDef.updater(parentEl, ev.target.value);});
      }
    },
    makeURL: function () {
      let stateCode = document.querySelector(`#${this.id} [name=stateCode]`).value;
      let county = document.querySelector(`#${this.id} [name=countyName]`).value;
      let limitPhrase = `$limit=100000`
      let stateCodePhrase = stateCode? `recip_state=${stateCode.toUpperCase()}&`: '';
      let countyPhrase = county? `recip_county=${county}&`: '';
      if (stateCode) {
        return this.endpoint + `?${[stateCodePhrase, countyPhrase, limitPhrase].join('&')}`;
      } else {
        message('Please enter two character state code');
      }
    },
    preprocess: function (data) {
      data = mergeCountyPopulation(data, 'recip_state', 'recip_county', 'STCODE', 'CTYNAME');
      data = sortOnDateAttr(data, 'date');
      return data;
    }
  },
  {
    id: 'DeathConds',
    name: 'CDC COVID Contributing Conditions',
    documentation: 'https://www.splitgraph.com/cdc-gov/conditions-contributing-to-deaths-involving-hk9y-quqm',
    endpoint: 'https://data.cdc.gov/resource/hk9y-quqm.json',
    apiToken: 'CYxytZqW1xHsoBvRkE7C74tUL',
    overriddenAttributes: [
      {
        name: 'data_as_of',
        type: 'date'
      },
      {
        name: 'start_date',
        type: 'date'
      },
      {
        name: 'end_date',
        type: 'date'
      },
    ],
    uiComponents: [
      {
        type: 'text',
        width: 12,
        name: 'state',
        apiName: 'state',
        label: 'Enter full state name'
      }
    ],
    uiCreate: function (parentEl) {
      parentEl.append(createUIControl(this.uiComponents[0]));
    },
    makeURL: function () {
      let stateName = document.querySelector(`#${this.id} input[type=text]`).value;
      if (stateName) {
        return this.endpoint + `?state=${toInitialCaps(stateName)}`;
      } else {
        message('Please enter full state name(initial caps)');
      }
    }
  },
  {
    id: 'ExcessDeaths',
    name: 'CDC COVID Excess Deaths',
    documentation: 'https://data.cdc.gov/NCHS/Excess-Deaths-Associated-with-COVID-19/xkkf-xrst',
    endpoint: 'https://data.cdc.gov/resource/xkkf-xrst.json',
    apiToken: 'CYxytZqW1xHsoBvRkE7C74tUL',
    uiComponents: [
      {
        type: 'text',
        width: 12,
        name: 'state',
        apiName: 'state',
        label: 'Enter full state name'
      }
    ],
    uiCreate: function (parentEl) {
      parentEl.append(createUIControl(this.uiComponents[0]));
    },
    makeURL: function () {
      let stateCode = document.querySelector(`#${this.id} input[type=text]`).value;
      if (stateCode) {
        return this.endpoint + `?state=${toInitialCaps(stateCode)}`;
      } else {
        message('Please enter full state name');
      }
    }
  },
  {
    id: 'Microdata',
    name: 'CDC Case Surveillance Public Use',
    documentation: 'https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Public-Use-Data/vbim-akqf',
    endpoint: 'https://data.cdc.gov/resource/vbim-akqf.json',
    apiToken: 'CYxytZqW1xHsoBvRkE7C74tUL',
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
        createElement('label', null, [
          'Number of cases(max 5000): ',
          createElement('input', null, [
            createAttribute('type', 'text'),
            createAttribute('style', 'width: 4em;')
          ])
        ])
      ]));
    },
    makeURL: function () {
      let value = document.querySelector(`#${this.id} input[type=text]`).value;
      value = (value && isNaN(value))?5000:Math.min(value, 5000);
      return this.endpoint + `?$limit=${value}`;
    }
  },
  {
    id: 'Microdata2',
    name: 'CDC COVID-19 Case Surveillance Public Use Data with Geography',
    documentation: 'https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Public-Use-Data-with-Ge/n8mc-b4w4',
    endpoint: 'https://data.cdc.gov/resource/n8mc-b4w4.json',
    apiToken: 'CYxytZqW1xHsoBvRkE7C74tUL',
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
        createElement('label', null, [
          'Enter Two Char State Abbr: ',
          createElement('input', 'in-state-digraph', [
            createAttribute('type', 'text'),
            createAttribute('style', 'width: 2em;')
          ])
        ]),
        createElement('br', null, null),
        createElement('label', null, [
          'Enter county name: ',
          createElement('input', 'in-county', [
            createAttribute('type', 'text'),
            createAttribute('style', 'width: 12em;')
          ])
        ]),
        createElement('br', null, null),
        createElement('label', null, [
          'Number of cases(max 5000): ',
          createElement('input', 'in-limit', [
            createAttribute('type', 'number'),
            createAttribute('style', 'width: 4em;')
          ])
        ]),
        createElement('br', null, null),
        createElement('label', null, [
            'Start date: ',
            createElement('input', ['in-start-date'], [
                createAttribute('type', 'date')
            ])
        ]),
        createElement('br', null, null),
        createElement('label', null, [
          'End date: ',
          createElement('input', ['in-end-date'], [
            createAttribute('type', 'date')
          ])
        ])
      ]));
    },
    makeURL: function () {
      let limit = document.querySelector(`#${this.id} .in-limit`).value;
      limit = (isNaN(limit) || limit <= 0)?5000:Math.min(limit, 5000);
      let limitPhrase = `$limit=${limit}`
      let stateCode = document.querySelector(`#${this.id} .in-state-digraph`).value.toUpperCase();
      let stateCodePhrase = stateCode? `res_state=${stateCode}&`: '';
      let county = document.querySelector(`#${this.id} .in-county`).value.toUpperCase();
      let countyPhrase = county?`res_county=${county}&`: '';
      let startDate = document.querySelector(`#${this.id} .in-start-date`).value;
      let endDate = document.querySelector(`#${this.id} .in-end-date`).value;
      let datePhrase = (startDate && endDate)? `$where=case_month>='${startDate}' AND case_month<='${endDate}'&`: '';
      return this.endpoint + `?${stateCodePhrase}${countyPhrase}${datePhrase}${limitPhrase}`;
    }
  },
  {
    id: 'Microdata3',
    name: 'CDC COVID-19 Case Surveillance Lancaster Co, PA',
    documentation: 'https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Public-Use-Data-with-Ge/n8mc-b4w4',
    endpoint: 'https://data.cdc.gov/resource/n8mc-b4w4.json',
    downsample: true,
    apiToken: 'CYxytZqW1xHsoBvRkE7C74tUL',
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
        createElement('label', null, [
          `Number of cases(max ${DOWNSAMPLE_GOAL_MAX}): `,
          createElement('input', 'in-limit', [
            createAttribute('type', 'number'),
            createAttribute('min', '0'),
            createAttribute('max', DOWNSAMPLE_GOAL_MAX),
            createAttribute('step', '100'),
            createAttribute('value', DOWNSAMPLE_GOAL_DEFAULT),
            createAttribute('style', 'width: 4em;')
          ])
        ]),
        createElement('br', null, null),
        createElement('label', null, [
          'Month: ',
          createElement('input', ['in-month'], [
            createAttribute('type', 'month'),
            createAttribute('min', '2020-01')
          ])
        ])
      ]));
    },
    makeURL: function () {
      const stateCode = 'PA', county='LANCASTER';
      downsampleGoal = document.querySelector(`#${this.id} .in-limit`).value;
      downsampleGoal = (isNaN(downsampleGoal) || downsampleGoal <= 0)?DOWNSAMPLE_GOAL_DEFAULT:Math.min(downsampleGoal, DOWNSAMPLE_GOAL_MAX);
      let limitPhrase = `$limit=20000`
      let stateCodePhrase = `res_state=${stateCode}&`;
      let countyPhrase = county?`res_county=${county}&`: '';
      let month = document.querySelector(`#${this.id} .in-month`).value || '2020-01';
      let datePhrase = `case_month=${month}&`;
      return this.endpoint + `?${stateCodePhrase}${countyPhrase}${datePhrase}${limitPhrase}`;
    }
  },
  {
    id: 'Microdata4',
    name: 'CDC COVID-19 Case Surveillance Selected States & Counties',
    documentation: 'https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Public-Use-Data-with-Ge/n8mc-b4w4',
    endpoint: 'https://data.cdc.gov/resource/n8mc-b4w4.json',
    apiToken: 'CYxytZqW1xHsoBvRkE7C74tUL',
    downsample: true,
    omittedAttributeNames: ['state_fips_code', 'county_fips_code', 'process', 'exposure'],
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
        createElement('label', null, [
            'State or county: ',
            createElement('select', 'in-geo', [
              createAttribute('id', 'in-geo'),
              createAttribute('required', 'required'),
              createElement('option', null, [
                 '-- Please choose a state or county --',
                createAttribute('value', '')
              ]),
              createElement('option', null, [
                'Colorado',
                createAttribute('value', 'res_state=CO')
              ]),
              createElement('option', null, [
                'Connecticut',
                createAttribute('value', 'res_state=CT')
              ]),
              createElement('option', null, [
                'Indiana',
                createAttribute('value', 'res_state=IN')
              ]),
              createElement('option', null, [
                'Maine',
                createAttribute('value', 'res_state=ME')
              ]),
              createElement('option', null, [
                'Missouri',
                createAttribute('value', 'res_state=MO')
              ]),
              createElement('option', null, [
                'Nebraska',
                createAttribute('value', 'res_state=NE')
              ]),
              createElement('option', null, [
                'New Mexico',
                createAttribute('value', 'res_state=NM')
              ]),
              createElement('option', null, [
                'New York',
                createAttribute('value', 'res_state=NY')
              ]),
              createElement('option', null, [
                'Pennsylvania',
                createAttribute('value', 'res_state=PA')
              ]),
              createElement('option', null, [
                'Orange County, CA',
                createAttribute('value', 'res_state=CA&res_county=ORANGE')
              ]),
            ])
          ]),
        createElement('br', null, null),
        createElement('label', null, [
          `Number of cases(max ${DOWNSAMPLE_GOAL_MAX}): `,
          createElement('input', 'in-limit', [
            createAttribute('type', 'number'),
            createAttribute('min', '0'),
            createAttribute('max', DOWNSAMPLE_GOAL_MAX),
            createAttribute('step', '100'),
            createAttribute('value', DOWNSAMPLE_GOAL_DEFAULT),
            createAttribute('style', 'width: 4em;')
          ])
        ]),
        createElement('br', null, null),
        createElement('label', null, [
          'Month: ',
          createElement('input', ['in-month'], [
            createAttribute('type', 'month'),
            createAttribute('min', '2020-01'),
            createAttribute('pattern', '[0-9]{4}-[0-9]{2}'),
            createAttribute('placeholder', 'yyyy-mm')
          ])
        ])
      ]));
    },
    makeURL: function () {
      downsampleGoal = document.querySelector(`#${this.id} .in-limit`).value;
      downsampleGoal = (isNaN(downsampleGoal) || downsampleGoal <= 0)?DOWNSAMPLE_GOAL_DEFAULT:Math.min(downsampleGoal, DOWNSAMPLE_GOAL_MAX);
      let limitPhrase = `$limit=100000`
      let stateCodePhrase = document.querySelector(`#${this.id} .in-geo`).value;
      let monthEl = document.querySelector(`#${this.id} .in-month`);
      let month = monthEl.checkValidity()? monthEl.value:'';
      let datePhrase = `&case_month=${month}&`;
      if (stateCodePhrase) {
        if (month) {
          return this.endpoint + `?${stateCodePhrase}${datePhrase}${limitPhrase}`;
        } else {
          message('Month has incorrect format (expect yyyy-mm) or out of range (2020-01 to present)');
        }
      } else {
        message('Please chose a state or county');
      }
    }
  },
  {
    id: 'TexasCases',
    name: 'Texas HHS Cases and Mortality',
    documentation: 'https://services5.arcgis.com/ACaLB9ifngzawspq/ArcGIS/rest/services/TX_DSHS_COVID19_Cases_Service/FeatureServer/2',
    endpoint: 'https://services5.arcgis.com/ACaLB9ifngzawspq/ArcGIS/rest/services/TX_DSHS_COVID19_Cases_Service/FeatureServer/2/query',
    downsample: false,
    preprocess: function (data) {
      // noinspection JSUnresolvedVariable
      return data.features.map(function (item) {
        item.attributes.Date = new Date(item.attributes.Date).toLocaleDateString();
        return item.attributes;
      });
    },
    uiCreate: function (parentEl) {
    },
    makeURL: function () {
      let wherePhrase = 'where=CumulativeCases>0';
      let outFieldsPhrase = 'outFields=*';
      let formatPhrase = 'f=json';
      return this.endpoint + `?${wherePhrase}&${outFieldsPhrase}&${formatPhrase}`;
    }
  },
  {
    id: 'TexasCounties',
    name: 'Texas HHS County Data',
    documentation: 'https://services5.arcgis.com/ACaLB9ifngzawspq/ArcGIS/rest/services/TX_DSHS_COVID19_Cases_Service/FeatureServer/1',
    endpoint: 'https://services5.arcgis.com/ACaLB9ifngzawspq/ArcGIS/rest/services/TX_DSHS_COVID19_Cases_Service/FeatureServer/1/query',
    downsample: false,
    preprocess: function (data) {
      // noinspection JSUnresolvedVariable
      return data.features.map(function (item) {
        item.attributes.Date = new Date(item.attributes.Date).toLocaleDateString();
        return item.attributes;
      });
    },
    uiCreate: function (parentEl) {
    },
    makeURL: function () {
      let wherePhrase = 'where=Positive>0';
      let outFieldsPhrase = 'outFields=*';
      let formatPhrase = 'f=json';
      return this.endpoint + `?${wherePhrase}&${outFieldsPhrase}&${formatPhrase}`;
    }
  }
]
const DEFAULT_DISPLAYED_DATASETS = ['StateData', 'VaccinesHistorical', 'Microdata4'];
const DEFAULT_DATASET = 'StateData';
const DOWNSAMPLE_GOAL_DEFAULT = 500;
const DOWNSAMPLE_GOAL_MAX = 1000;
const CHILD_COLLECTION_NAME = 'cases';
const PARENT_COLLECTION_NAME = 'groups';

let displayedDatasets = DEFAULT_DISPLAYED_DATASETS;
let downsampleGoal = DOWNSAMPLE_GOAL_DEFAULT;
let isInFetch = false;

/**
 * A utility to merge state population stats with a dataset.
 * @param data {[object]} attribute keyed data
 * @param referenceKeyAttr {string} the name of the attribute in the merged into dataset that
 *                         is a foreign key into the population dataset.
 * @param correlatedKey    {string} the corresponding key in the population dataset
 * @return {[object]} the data object modified
 */
function mergePopulation(data, referenceKeyAttr, correlatedKey) {
  let cached = null;
  data.forEach(function(dataItem) {
    let key = dataItem[referenceKeyAttr];
    if (!cached || (cached[correlatedKey] !== key)) {
      cached = STATE_POPULATION_DATA.find(function (st) {
        return st[correlatedKey] === key.toLocaleUpperCase();
      })
    }
    if (cached) {
      dataItem.population = cached.Population;
    }
  });
  return data;
}
/**
 * A utility to merge state population stats with a dataset.
 * @param data {[object]} attribute keyed data
 * @param referenceKeyAttr {string} the name of the attribute in the merged into dataset that
 *                         is a foreign key into the population dataset.
 * @param correlatedKey    {string} the corresponding key in the population dataset
 * @return {[object]} the data object modified
 */
function mergeCountyPopulation(data, referenceState, referenceCty, correlatedState, correlatedCty) {
  let cachedPopRecord = null;
  data.forEach(function(dataItem) {
    let stateKey = dataItem[referenceState];
    let countyKey = dataItem[referenceCty];
    if (!cachedPopRecord || (cachedPopRecord[correlatedState] !== stateKey) || (cachedPopRecord[correlatedCty] !== countyKey)) {
      cachedPopRecord = COUNTY_POPULATION_DATA.find(function (item) {
        return item[correlatedState] === stateKey && item[correlatedCty] === countyKey;
      })
    }
    if (cachedPopRecord) {
      dataItem.population = cachedPopRecord.POPESTIMATE2019;
    }
  });
  return data;
}

/**
 * A utility to sort a dataset on a date attribute.
 * @param data {[object]}
 * @param attr {string}
 * @return {[object]} 'data' sorted
 */
function sortOnDateAttr(data, attr) {
  return data.sort(function (a, b) {
    return (new Date(a[attr])) - (new Date(b[attr]));
  })
}

function _csc(def, optionList) {
  let l = def.label || '';
  let n = def.name || '';
  let selectEl = createElement('select', null,
      [createAttribute('name',
          n)]);
  optionList.forEach(function (v) {
    selectEl.append(createElement('option', [], [v]));
  })
  return createElement('div', null, [createElement('label', null,
      [
        `${l}: `,
        selectEl,
      ])
  ]);

}
function createSelectControl(def) {
  return _csc(def, def.lister());
}

// function createConditionalSelectControl(def) {
//   let conditionalEl = document.querySelector(`#${def.section} [name=${def.dependsUpon}]`);
//   let conditional = conditionalEl? conditionalEl.value: def.default;
//   let list = conditional? def.lister(conditional): [];
//   return csc(def, list);
// }

function createTextControl(def) {
  let w = def.width || 10;
  let l = def.label || '';
  let n = def.name || '';
  return createElement('div', null, [createElement('label', null,
      [`${l}: `, createElement('input', null,
          [createAttribute('type', 'text'), createAttribute('name',
              n), createAttribute('style', `width: ${w}em;`)])])]);
}

function createUIControl(def) {
  let el;
  switch (def.type) {
    case 'text':
      el = createTextControl(def);
      break;
    case 'select':
      el = createSelectControl(def);
      break;
    // case 'conditionalSelect':
    //   el = createConditionalSelectControl(def);
    //   break;
    default:
      console.warn(`createUIControl: unknown type: ${def.type}`);
  }
  return el;
}

/**
 * A utility to create a DOM element with classes and content.
 * @param tag {string}
 * @param [classList] {[string]}
 * @param [content] {[Node]}
 * @return {Element}
 */
function createElement(tag, classList, content) {
  let el = document.createElement(tag);
  if (classList) {
    if (typeof classList === 'string') classList = [classList];
    classList.forEach( function (cl) {el.classList.add(cl);});
  }
  if (content) {
    if (!Array.isArray(content)) { content = [content];}
    content.forEach(function(c) {
      if (c instanceof Attr) {
        el.setAttributeNode(c);
      } else {
        el.append(c);
      }
    });
  }
  return el;
}

/**
 * A utility to create a DOM attribute node.
 * @param name {string}
 * @param value {*}
 * @return {Attr}
 */
function createAttribute(name, value) {
  let attr = document.createAttribute(name);
  attr.value = value;
  return attr;
}

/**
 * A utility to convert a string to capitalize the first letter of each word
 * and lowercase each succeeding letter. A word is considered to be a string
 * separated from other words by space characters.
 * @param str {string}
 * @return {string}
 */
function toInitialCaps(str) {
  return str.split(/ +/)
      .map(function (w) {
        return w.toLowerCase().replace(/./, w[0].toUpperCase());
      }).join(' ');
}

/**
 * Creates a dataset in CODAP.
 *
 * @param datasetName {string}
 * @param collectionList {[object]}
 * @return {{collections: [{name: string, attrs: *}], name, title}}
 */
function specifyDataset(datasetName, collectionList) {
  return {
    name: datasetName,
    title: datasetName,
    collections: collectionList
  };
}

/**
 * Creates a dataset in CODAP only if it does not exist.
 * @param datasetName {string}
 * @param collectionList {[object]}
 * @return Promise
 */
function guaranteeDataset(datasetName, collectionList) {
  return codapInterface.sendRequest({action: 'get', resource: `dataContext[${datasetName}]`})
      .then(function (result) {
        if (result && result.success) {
          return Promise.resolve(result.values);
        } else {
          return codapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: specifyDataset(datasetName, collectionList)
          });
        }
      })
}

function createCaseTable(datasetName) {
  return codapInterface.sendRequest({
    action: 'create',
    resource: `component`,
    values: {
      type: "caseTable",
      dataContext: datasetName
    }
  })
  .then(function (result) {
    if (result.success) {
      let componentID = result.values.id;
      if (componentID) {
        return codapInterface.sendRequest({
          action: 'notify',
          resource: `component[${componentID}]`,
          values: {request: 'autoScale'}
        })
      }
    }
  });
}

function sendItemsToCODAP(datasetName, data) {
  return codapInterface.sendRequest({
    action: 'create',
    resource: `dataContext[${datasetName}].item`,
    values: data
  });
}

function selectSource(/*ev*/) {
  // this is the selected event
  document.querySelectorAll('.datasource').forEach((el) => el.classList.remove('selected-source'));
  this.parentElement.parentElement.classList.add('selected-source');
}

function setBusy(isBusy) {
  if (isBusy) {
    document.body.classList.add('busy');
  } else {
    document.body.classList.remove('busy');
  }
  isInFetch = isBusy;
}

function fetchHandler(/*ev*/) {
  if (!isInFetch)
  setBusy(true);
  fetchDataAndProcess().then(
      function (result) {
        if (result && !result.success) {
          message(`Import to CODAP failed. ${result.values.error}`)
        } else if (result && result.success) {
          message('');
        }
        setBusy(false)
      },
      function (err) {
        message(err);
        setBusy(false)
      }
  );
}

function createUI () {
  let anchor = document.querySelector('.contents');
  displayedDatasets.forEach(function (dsId) {
    let ix = DATASETS.findIndex(function (d) {return d.id === dsId});
    if (ix>=0) {
      let ds = DATASETS[ix]
      let el = createElement('div', ['datasource'], [
        createAttribute('id', ds.id),
        createElement('h3', null, [
          createElement('input', null, [
            createAttribute('type', 'radio'),
            createAttribute('name', 'source'),
            createAttribute('value', ix)
          ]),
          ds.name
        ]),
        createElement('div', [], [
          createElement('a', [], [
            createAttribute('href', ds.documentation),
            createAttribute('target', '_blank'),
            'dataset documentation'
          ])
        ])
      ]);

      ds.uiCreate(el);
      anchor.append(el);
      if (ds.id === DEFAULT_DATASET) {
        let input = el.querySelector('input');
        input.checked = true;
        el.classList.add('selected-source')
      }
    }
  })
  document.querySelectorAll('input[type=radio][name=source]')
      .forEach((el) => el.addEventListener('click', selectSource))
  document.querySelectorAll('input[type=text]')
      .forEach(function (el) { el.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          fetchHandler(ev);
        }
      })})
  let button = document.querySelector('button.fetch-button');
  button.addEventListener('click', fetchHandler);
}

function init() {
  let datasets = (new URL(document.location)).searchParams.get('datasets');
  if (datasets) {
    if (datasets === 'all') {
      datasets = DATASETS.map(function (ds) { return ds.id; });
    } else {
      datasets = datasets.split(',');
    }
    displayedDatasets = datasets;
  }

  codapInterface.init({
    name: APP_NAME,
    title: APP_NAME,
    dimensions:{width: 360, height: 440},
    preventDataContextReorg: false
  }).then(createUI);
}

/**
 *  Displays a message in the message area
 *  @param msg {string}
 **/
function message(msg) {
  let messageEl = document.querySelector('#msg');
  messageEl.innerHTML = msg;
}

function getLastMessage() {
  let messageEl = document.querySelector('#msg');
  return messageEl.innerText;
}

/**
 * Is passed an array of objects. Returns the keys for the first object
 * in the array. Assumes all other objects have identical keys.
 * @param array {object[]}
 * @return {string[]}
 */
function getAttributeNamesFromData(array) {
  if (!Array.isArray(array) || !array[0] || (typeof array[0] !== "object")) {
    return [];
  }
  return Object.keys(array[0]);
}

function downsampleRandom(data, targetCount, start) {
  let dataLength = data.length - start;
  let ct = Math.min(dataLength, Math.max(0, targetCount));
  let randomAreSelected = ct < (dataLength/2);
  let pickArray = new Array(dataLength).fill(!randomAreSelected);
  if (!randomAreSelected) {
    ct = dataLength - ct;
  }

  // construct an array of selection choices
  let i = 0;
  while (i < ct) {
    let value = Math.floor(Math.random()*dataLength);
    if (pickArray[value] !== randomAreSelected) {
      i++;
      pickArray[value] = randomAreSelected;
    }
  }

  let newData = [];
  // copy the non-data rows
  for (let ix = 0; ix < start; ix += 1) {
    newData.push(data[ix]);
  }
  // use pick array to determine if we should add each row of original table to new
  pickArray.forEach(function(shouldPick, ix) {
    if (shouldPick) newData.push(data[ix + start]);
  });

  return newData;
}

function resolveAttributes(datasetSpec, attributeNames) {
  let omittedAttributeNames = datasetSpec.omittedAttributeNames || [];
  attributeNames = attributeNames.filter(
      function (attrName) {
        return !omittedAttributeNames.includes(attrName);
      });
  if (attributeNames) {
    let attributeList = attributeNames.map(function (attrName) {
      return {name: attrName};
    })
    if (datasetSpec.overriddenAttributes) {
      datasetSpec.overriddenAttributes.forEach(function (overrideAttr) {
        let attr = attributeList.find(function (attr) {
          return attr.name === overrideAttr.name;
        });
        if (attr) {
          Object.assign(attr, overrideAttr);
        }
      })
    }
    if (datasetSpec.additionalAttributes) {
      attributeList = attributeList.concat(datasetSpec.additionalAttributes);
    }
    return attributeList;
  }
}

function resolveCollectionList(datasetSpec, attributeNames) {
  let attributeList = resolveAttributes(datasetSpec, attributeNames);
  let collectionsList = [];
  let childCollection = {
    name: CHILD_COLLECTION_NAME,
    attrs: []
  }
  let parentCollection;
  if (datasetSpec.parentAttributes) {
    parentCollection = {
      name: PARENT_COLLECTION_NAME,
      attrs: []
    }
    collectionsList.push(parentCollection);
    childCollection.parent = PARENT_COLLECTION_NAME;
  }
  collectionsList.push(childCollection);

  attributeList.forEach(function (attr) {
    if (datasetSpec.parentAttributes && datasetSpec.parentAttributes.includes(attr.name)) {
      parentCollection.attrs.push(attr);
    } else {
      childCollection.attrs.push(attr);
    }
  });
  return collectionsList;
}
/**
 * Fetches data from the selected dataset and sends it to CODAP.
 * @return {Promise<Response>}
 */
function fetchDataAndProcess() {
  let sourceSelect = document.querySelector('input[name=source]:checked');
  if (!sourceSelect) {
    message('Pick a source');
    return Promise.reject('No source selected');
  }
  let sourceIX = Number(sourceSelect.value);
  let datasetSpec = DATASETS[sourceIX];
  let url = datasetSpec.makeURL();
  let headers = new Headers();
  if (datasetSpec.apiToken) {
    headers.append('X-App-Token', datasetSpec.apiToken);
  }
  if (!url) { return Promise.reject(getLastMessage()); }
  // console.log(`source: ${sourceIX}:${datasetSpec.name}, url: ${url}`);
  message(`Fetching ${datasetSpec.name}...`)
  return fetch(url, {headers: headers}).then(function (response) {
    if (response.ok) {
      message('Converting...')
      return response.json().then(function (data) {
        if (datasetSpec.preprocess) {
          data = datasetSpec.preprocess(data);
        }
        if (datasetSpec.downsample && downsampleGoal) {
          data = downsampleRandom(data, downsampleGoal, 0);
        }
        let collectionList = resolveCollectionList(datasetSpec, getAttributeNamesFromData(
            data));
        if (collectionList) {
          return guaranteeDataset(datasetSpec.name, collectionList)
              .then(function () {
                message('Sending data to CODAP')
                return sendItemsToCODAP(datasetSpec.name, data);
              })
              .then(function () {
                message('creating a case table');
                return createCaseTable(datasetSpec.name);
              });
        }
        else {
          return Promise.reject('CDC Server returned no data');
        }
      });
    } else {
      return Promise.reject(response.statusText);
    }
  });
}

window.addEventListener('load', init);
