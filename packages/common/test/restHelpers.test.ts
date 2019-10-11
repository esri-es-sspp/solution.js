/** @license
 * Copyright 2018 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Provides tests for functions involving the arcgis-rest-js library.
 */

import {
  createFeatureService,
  _getCreateServiceOptions,
  _setItemProperties,
  addToServiceDefinition,
  createItemWithData,
  updateItemURL,
  updateItem,
  getServiceLayersAndTables,
  _countRelationships,
  getLayers,
  extractDependencies,
  convertExtent,
  getLayerUpdates,
  _getUpdate,
  getRequest,
  _getRelationshipUpdates,
  createUniqueFolder
} from "../src/restHelpers";
import {
  TOMORROW,
  createRuntimeMockUserSession,
  setMockDateTime,
  checkForArcgisRestSuccessRequestError
} from "../test/mocks/utils";
import { IItemTemplate, IPostProcessArgs, IUpdate } from "../src/interfaces";
import * as fetchMock from "fetch-mock";
import { UserSession } from "@esri/arcgis-rest-auth";
import * as mockItems from "../test/mocks/agolItems";
import * as portal from "@esri/arcgis-rest-portal";

// ------------------------------------------------------------------------------------------------------------------ //

let itemTemplate: IItemTemplate;

beforeEach(() => {
  itemTemplate = {
    itemId: "",
    key: "",
    properties: {
      service: {},
      layers: [
        {
          fields: []
        }
      ],
      tables: []
    },
    type: "",
    item: {},
    data: {},
    estimatedDeploymentCostFactor: 0,
    resources: [],
    dependencies: []
  };
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = new UserSession({
  clientId: "clientId",
  redirectUri: "https://example-app.com/redirect-uri",
  token: "fake-token",
  tokenExpires: TOMORROW,
  refreshToken: "refreshToken",
  refreshTokenExpires: TOMORROW,
  refreshTokenTTL: 1440,
  username: "casey",
  password: "123456",
  portal: "https://myorg.maps.arcgis.com/sharing/rest"
});

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://www.arcgis.com",
  authInfo: {}
};

const portalSR: any = {
  wkid: 1
};
const serviceSR: any = {
  wkid: 2
};

const extent: any = {
  xmin: -131,
  ymin: 16,
  xmax: -57,
  ymax: 58,
  spatialReference: portalSR
};

const expectedExtent: any = {
  xmin: -131,
  ymin: 16,
  xmax: -57,
  ymax: 58,
  spatialReference: serviceSR
};

const geometryServiceUrl: string = "http://utility/geomServer";

const projectedGeometries: any[] = [
  {
    x: -131,
    y: 16
  },
  {
    x: -57,
    y: 58
  }
];

const initiative: any = {
  orgExtent: [[0, 0], [1, 1]],
  defaultExtent: {
    xmin: 0,
    ymin: 0,
    xmax: 1,
    ymax: 1,
    spatialReference: {
      wkid: 102100
    }
  },
  spatialReference: {
    wkid: 102100
  }
};

afterEach(() => {
  fetchMock.restore();
});

describe("Module `restHelpers`: common REST utility functions shared across packages", () => {
  describe("addToServiceDefinition", () => {
    it("can handle failure", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0";

      fetchMock.post(adminUrl + "/addToDefinition", mockItems.get400Failure());

      addToServiceDefinition(url, {}).then(
        () => done.fail(),
        error => {
          jasmine.clock().uninstall();
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("can add", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0";

      fetchMock.post(adminUrl + "/addToDefinition", '{"success": true}');

      addToServiceDefinition(url, {}).then(
        () => {
          jasmine.clock().uninstall();
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("createFeatureService", () => {
    it("can handle failure", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
        mockItems.get400Failure()
      );

      const properties: any = {
        service: {
          somePropNotInItem: true,
          isView: true,
          capabilities: "Query"
        },
        layers: [
          {
            fields: []
          }
        ],
        tables: []
      };

      const item: any = {
        id: "0",
        name: "A"
      };

      const template: any = {
        item,
        data: {},
        properties
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: true,
        solutionItemId: "sol1234567890"
      };

      createFeatureService(
        template,
        MOCK_USER_SESSION,
        templateDictionary
      ).then(
        () => {
          jasmine.clock().uninstall();
          done.fail();
        },
        error => {
          jasmine.clock().uninstall();
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("can create a service", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      jasmine.clock().uninstall();
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: UserSession = createRuntimeMockUserSession(
        setMockDateTime(now)
      );

      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
          '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
            "ROWPermits_publiccomment_" +
            now +
            '/FeatureServer","itemId":"svc1234567890",' +
            '"name":"ROWPermits_publiccomment_' +
            now +
            '","serviceItemId":"svc1234567890",' +
            '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
            now +
            '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/move",
          '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}'
        );

      const properties: any = {
        service: {
          somePropNotInItem: true,
          isView: true,
          capabilities: "Query",
          spatialReference: {
            wkid: 102100
          }
        },
        layers: [
          {
            fields: []
          }
        ],
        tables: []
      };

      const template: any = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        item: {
          id: "0",
          name: "A"
        },
        data: {},
        properties
      };
      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: true,
        solutionItemId: "sol1234567890",
        initiative: initiative,
        ab766cba0dd44ec080420acc10990282: {},
        organization: { geometryServiceUrl: geometryServiceUrl }
      };

      createFeatureService(
        template,
        sessionWithMockedTime,
        templateDictionary
      ).then(
        () => {
          jasmine.clock().uninstall();
          done();
        },
        () => {
          jasmine.clock().uninstall();
          done.fail();
        }
      );
    });
  });

  describe("createItemWithData", () => {
    it("can handle private specification", done => {
      const itemInfo: any = {};
      const dataInfo: any = {};
      const folderId = "fld1234567890";
      const access = "private";

      const createUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      fetchMock.post(createUrl, expectedCreate);

      createItemWithData(
        itemInfo,
        dataInfo,
        MOCK_USER_SESSION,
        folderId,
        access
      ).then(
        (response: portal.ICreateItemResponse) => {
          expect(response).toEqual(expectedCreate);
          done();
        },
        () => done.fail
      );
    });

    it("can handle org specification", done => {
      const itemInfo: any = {};
      const dataInfo: any = {};
      const folderId = "fld1234567890";
      const access = "org";

      const createUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      const shareUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/share";
      const expectedShare = {
        notSharedWith: [] as string[],
        itemId: expectedCreate.id
      };
      fetchMock.post(createUrl, expectedCreate).post(shareUrl, expectedShare);

      createItemWithData(
        itemInfo,
        dataInfo,
        MOCK_USER_SESSION,
        folderId,
        access
      ).then(
        (response: portal.ICreateItemResponse) => {
          expect(response).toEqual(expectedCreate);
          done();
        },
        () => done.fail
      );
    });

    it("can handle public specification", done => {
      const itemInfo: any = {};
      const dataInfo: any = {};
      const folderId = "fld1234567890";
      const access = "public";

      const createUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      const shareUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/share";
      const expectedShare = {
        notSharedWith: [] as string[],
        itemId: expectedCreate.id
      };
      fetchMock.post(createUrl, expectedCreate).post(shareUrl, expectedShare);

      createItemWithData(
        itemInfo,
        dataInfo,
        MOCK_USER_SESSION,
        folderId,
        access
      ).then(
        (response: portal.ICreateItemResponse) => {
          expect(response).toEqual(expectedCreate);
          done();
        },
        () => done.fail
      );
    });

    it("can handle failure to change created item's access", done => {
      const itemInfo: any = {};
      const dataInfo: any = {};
      const folderId = "fld1234567890";
      const access = "public";

      const createUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      const shareUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/share";
      const expectedShare = {
        error: {
          code: 400,
          messageCode: "CONT_0001",
          message: "Item does not exist or is inaccessible.",
          details: [] as any[]
        }
      };
      fetchMock.post(createUrl, expectedCreate).post(shareUrl, expectedShare);

      createItemWithData(
        itemInfo,
        dataInfo,
        MOCK_USER_SESSION,
        folderId,
        access
      ).then(
        () => done.fail,
        response => {
          expect(response.success).toEqual(false);
          done();
        }
      );
    });
  });

  describe("createUniqueFolder", () => {
    it("folder doesn't already exist", done => {
      const folderTitleRoot = "folder name";
      const suffix = 0;
      const expectedSuccess = successfulFolderCreation(folderTitleRoot, suffix);

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        JSON.stringify(expectedSuccess)
      );
      createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION).then(
        (response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        },
        done.fail
      );
    });

    it("initial version of folder exists", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 1;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );

      let suffix = 0;
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        () => {
          const response =
            suffix === expectedSuffix
              ? JSON.stringify(
                  successfulFolderCreation(folderTitleRoot, suffix)
                )
              : JSON.stringify(failedFolderCreation(folderTitleRoot, suffix));
          ++suffix;
          return response;
        }
      );
      createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION).then(
        (response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        },
        done.fail
      );
    });

    it("two versions of folder exist", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 2;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );

      let suffix = 0;
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        () => {
          const response =
            suffix === expectedSuffix
              ? JSON.stringify(
                  successfulFolderCreation(folderTitleRoot, suffix)
                )
              : JSON.stringify(failedFolderCreation(folderTitleRoot, suffix));
          ++suffix;
          return response;
        }
      );
      createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION).then(
        (response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        },
        done.fail
      );
    });

    it("three versions of folder exist", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 3;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );

      let suffix = 0;
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        () => {
          const response =
            suffix === expectedSuffix
              ? JSON.stringify(
                  successfulFolderCreation(folderTitleRoot, suffix)
                )
              : JSON.stringify(failedFolderCreation(folderTitleRoot, suffix));
          ++suffix;
          return response;
        }
      );
      createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION).then(
        (response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        },
        done.fail
      );
    });

    it("can handle abbreviated error", done => {
      const folderTitleRoot = "My Folder";
      const userSession = MOCK_USER_SESSION;

      const createUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder";
      const expectedCreate = {
        error: {
          code: 400,
          message: "Unable to create folder.",
          details: [] as any[]
        }
      };
      fetchMock.post(createUrl, expectedCreate);

      createUniqueFolder(folderTitleRoot, userSession).then(
        () => done.fail,
        response => {
          expect(response.success).toBeUndefined();
          expect(response.message).toEqual("400: Unable to create folder.");
          done();
        }
      );
    });

    it("can handle extended error", done => {
      const folderTitleRoot = "My Folder";
      const userSession = MOCK_USER_SESSION;

      const createUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder";
      const expectedCreate = {
        error: {
          code: 400,
          message: "Unable to create folder.",
          details: ["Folder title '" + folderTitleRoot + "' not available."]
        }
      };
      fetchMock.post(createUrl, expectedCreate);

      createUniqueFolder(folderTitleRoot, userSession).then(
        () => done.fail,
        response => {
          expect(response.success).toBeUndefined();
          expect(response.message).toEqual("400: Unable to create folder.");
          done();
        }
      );
    });
  });

  describe("extractDependencies", () => {
    it("should handle error", done => {
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = baseSvcURL;
      itemTemplate.properties.service.isView = true;

      fetchMock.post(baseSvcURL + "/sources?f=json", mockItems.get400Failure());
      extractDependencies(itemTemplate, MOCK_USER_SESSION).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("should get empty array when the service is not a view", () => {
      const expected: any[] = [];
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = baseSvcURL;
      itemTemplate.properties.service.isView = false;

      fetchMock.post(
        baseSvcURL + "/sources?f=json",
        mockItems.getAGOLServiceSources()
      );
      extractDependencies(itemTemplate, MOCK_USER_SESSION).then(
        dependencies => {
          expect(dependencies).toEqual(expected);
        },
        () => fail()
      );
    });

    it("should get array of dependencies for a view", done => {
      const expected: any[] = [
        {
          id: "svc1234567890",
          name: "OtherSourceServiceName"
        }
      ];
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = baseSvcURL;
      itemTemplate.properties.service.isView = true;

      fetchMock.post(
        itemTemplate.item.url + "/sources?f=json",
        mockItems.getAGOLServiceSources()
      );
      extractDependencies(itemTemplate, MOCK_USER_SESSION).then(
        dependencies => {
          expect(dependencies).toEqual(expected);
          done();
        },
        e => fail(e)
      );
    });
  });

  describe("convertExtent", () => {
    it("can handle unmatched wkid", done => {
      fetchMock
        .post(geometryServiceUrl + "/findTransformations", {
          transformations: [
            {
              wkid: 3
            }
          ]
        })
        .post(geometryServiceUrl + "/project", {
          geometries: projectedGeometries
        })
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      convertExtent(
        extent,
        serviceSR,
        geometryServiceUrl,
        MOCK_USER_SESSION
      ).then(_extent => {
        expect(_extent).toEqual(expectedExtent);
        done();
      }, done.fail);
    });

    it("can handle unmatched wkid and geoTransforms", done => {
      fetchMock
        .post(geometryServiceUrl + "/findTransformations", {
          transformations: [
            {
              geoTransforms: 3
            }
          ]
        })
        .post(geometryServiceUrl + "/project", {
          geometries: projectedGeometries
        })
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      convertExtent(
        extent,
        serviceSR,
        geometryServiceUrl,
        MOCK_USER_SESSION
      ).then(_extent => {
        expect(_extent).toEqual(expectedExtent);
        done();
      }, done.fail);
    });

    it("can handle unmatched wkid and no transformations", done => {
      fetchMock
        .post(geometryServiceUrl + "/findTransformations", {})
        .post(geometryServiceUrl + "/project", {
          geometries: projectedGeometries
        })
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      convertExtent(
        extent,
        serviceSR,
        geometryServiceUrl,
        MOCK_USER_SESSION
      ).then(_extent => {
        expect(_extent).toEqual(expectedExtent);
        done();
      }, done.fail);
    });

    it("can handle unmatched wkid and unexpected transformations", done => {
      fetchMock
        .post(geometryServiceUrl + "/findTransformations", {
          transformations: [{}]
        })
        .post(geometryServiceUrl + "/project", {
          geometries: projectedGeometries
        })
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      convertExtent(
        extent,
        serviceSR,
        geometryServiceUrl,
        MOCK_USER_SESSION
      ).then(_extent => {
        expect(_extent).toEqual(expectedExtent);
        done();
      }, done.fail);
    });

    it("can handle unmatched wkid and no geom in response", done => {
      fetchMock
        .post(geometryServiceUrl + "/findTransformations", {
          transformations: [
            {
              wkid: 3
            }
          ]
        })
        .post(geometryServiceUrl + "/project", {
          geometries: []
        })
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      const expected: any = undefined;

      convertExtent(
        extent,
        serviceSR,
        geometryServiceUrl,
        MOCK_USER_SESSION
      ).then(_extent => {
        expect(_extent).toEqual(expected);
        done();
      }, done.fail);
    });

    it("can handle unmatched wkid and failure on project", done => {
      fetchMock
        .post(geometryServiceUrl + "/findTransformations", {
          transformations: [
            {
              wkid: 3
            }
          ]
        })
        .post(geometryServiceUrl + "/project", mockItems.get400Failure())
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      convertExtent(
        extent,
        serviceSR,
        geometryServiceUrl,
        MOCK_USER_SESSION
      ).then(_extent => {
        done.fail();
      }, done);
    });

    it("can handle unmatched wkid and failure on findTransformations", done => {
      fetchMock
        .post(
          geometryServiceUrl + "/findTransformations",
          mockItems.get400Failure()
        )
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      convertExtent(
        extent,
        serviceSR,
        geometryServiceUrl,
        MOCK_USER_SESSION
      ).then(_extent => {
        done.fail();
      }, done);
    });
  });

  describe("getLayers", () => {
    it("can handle error", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = url;

      fetchMock.post(adminUrl + "/0?f=json", mockItems.get400Failure());
      getLayers(url, [{ id: 0 }], MOCK_USER_SESSION).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });
  });

  describe("getLayerUpdates", () => {
    it("can get updates", () => {
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      itemTemplate.item.url = url;

      const relationships: any[] = [{ relationshipMock: "A" }];

      const objects: any = {
        0: {
          a: "a",
          type: "A",
          id: 0,
          relationships: relationships,
          deleteFields: ["A", "B"]
        }
      };

      const args: IPostProcessArgs = {
        message: "refresh",
        objects: objects,
        itemTemplate: itemTemplate,
        authentication: MOCK_USER_SESSION,
        progressTickCallback: function(opts: any) {
          return opts;
        }
      };

      const updates: any[] = getLayerUpdates(args);

      const _object: any = Object.assign({}, objects[0]);
      delete _object.type;
      delete _object.id;
      delete _object.relationships;
      delete _object.deleteFields;

      const expected: any[] = [
        {
          url: adminUrl + "/refresh",
          params: {
            f: "json"
          },
          args
        },
        {
          url: adminUrl + "/0/deleteFromDefinition",
          params: {
            deleteFromDefinition: {
              fields: objects[0].deleteFields
            }
          },
          args: args
        },
        {
          url: adminUrl + "/refresh",
          params: {
            f: "json"
          },
          args
        },
        {
          url: adminUrl + "/0/updateDefinition",
          params: {
            updateDefinition: _object
          },
          args: args
        },
        {
          url: adminUrl + "/refresh",
          params: {
            f: "json"
          },
          args
        },
        {
          url: adminUrl + "/addToDefinition",
          params: {
            addToDefinition: {
              layers: [
                {
                  id: 0,
                  relationships: relationships
                }
              ]
            }
          },
          args
        },
        {
          url: adminUrl + "/refresh",
          params: {
            f: "json"
          },
          args
        }
      ];
      expect(updates).toEqual(expected);
    });
  });

  describe("getRequest", () => {
    it("should get request successfully", done => {
      itemTemplate.key = "123456";

      const args: IPostProcessArgs = {
        message: "refresh",
        objects: [],
        itemTemplate: itemTemplate,
        authentication: MOCK_USER_SESSION,
        progressTickCallback: function(opts: any) {
          return opts;
        }
      };

      const baseAdminSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      const update: IUpdate = {
        url: baseAdminSvcURL + "/FeatureServer/refresh",
        params: {},
        args: args
      };

      fetchMock.post(
        baseAdminSvcURL + "/FeatureServer/refresh",
        '{"success":true}'
      );

      getRequest(update).then(() => done(), error => done.fail(error));
    });

    it("should handle error", done => {
      itemTemplate.key = "123456";

      const args: IPostProcessArgs = {
        message: "refresh",
        objects: [],
        itemTemplate: itemTemplate,
        authentication: MOCK_USER_SESSION,
        progressTickCallback: function(opts: any) {
          return opts;
        }
      };

      const baseAdminSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      const update: IUpdate = {
        url: baseAdminSvcURL + "/FeatureServer/refresh",
        params: {},
        args: args
      };

      fetchMock.post(
        baseAdminSvcURL + "/FeatureServer/refresh",
        mockItems.get400Failure()
      );

      getRequest(update).then(
        () => done.fail(),
        error => {
          expect(error.name).toEqual("ArcGISRequestError");
          done();
        }
      );
    });
  });

  describe("getServiceLayersAndTables", () => {
    it("can handle failure to fetch service", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", mockItems.get400Failure());
      getServiceLayersAndTables(itemTemplate, MOCK_USER_SESSION).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("can handle failure to fetch layer", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService([{ id: 0 }], []);
      expected.properties.service.layers[0].name = "A";
      expected.properties.layers[0] = expected.properties.service.layers[0];
      expected.item.url = url;
      expected.estimatedDeploymentCostFactor = 1;

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", expected.properties.service);
      fetchMock.post(adminUrl + "/0?f=json", mockItems.get400Failure());
      getServiceLayersAndTables(itemTemplate, MOCK_USER_SESSION).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("can fetch layers", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService([{ id: 0 }], []);
      expected.properties.service.layers[0].name = "A";
      expected.properties.layers[0] = expected.properties.service.layers[0];
      expected.item.url = url;
      expected.estimatedDeploymentCostFactor = 1;

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", expected.properties.service);
      fetchMock.post(
        adminUrl + "/0?f=json",
        expected.properties.service.layers[0]
      );
      getServiceLayersAndTables(itemTemplate, MOCK_USER_SESSION).then(
        template => {
          expect(template).toEqual(expected);
          done();
        },
        () => done.fail()
      );
    });

    it("can fetch layers and tables", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService(
        [{ id: 0 }],
        [{ id: 1 }]
      );
      expected.properties.service.layers[0].name = "A";
      expected.properties.service.tables[0].name = "B";
      expected.properties.layers[0] = expected.properties.service.layers[0];
      expected.properties.tables[0] = expected.properties.service.tables[0];
      expected.item.url = url;
      expected.estimatedDeploymentCostFactor = 2;

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", expected.properties.service);
      fetchMock.post(
        adminUrl + "/0?f=json",
        expected.properties.service.layers[0]
      );
      fetchMock.post(
        adminUrl + "/1?f=json",
        expected.properties.service.tables[0]
      );
      getServiceLayersAndTables(itemTemplate, MOCK_USER_SESSION).then(
        template => {
          expect(template).toEqual(expected);
          done();
        },
        () => done.fail()
      );
    });

    it("can fetch layers and tables with a relationship", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService(
        [{ id: 0 }],
        [{ id: 1 }]
      );
      expected.properties.service.layers[0].name = "A";
      expected.properties.service.tables[0].name = "B";
      expected.properties.layers[0] = mockItems.getAGOLLayerOrTable(
        0,
        "A",
        "Feature Layer",
        [{}]
      );
      expected.properties.tables[0] = mockItems.getAGOLLayerOrTable(
        1,
        "B",
        "Table",
        [{}]
      );
      expected.item.url = url;
      expected.estimatedDeploymentCostFactor = 4;

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", expected.properties.service);
      fetchMock.post(adminUrl + "/0?f=json", expected.properties.layers[0]);
      fetchMock.post(adminUrl + "/1?f=json", expected.properties.tables[0]);
      getServiceLayersAndTables(itemTemplate, MOCK_USER_SESSION).then(
        template => {
          expect(template).toEqual(expected);
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("shareItem", () => {
    xit("shareItem", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("updateItem", () => {
    it("can handle failure", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/update",
        mockItems.get400Failure()
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      updateItem(
        "svc1234567890",
        itemTemplate.item,
        itemTemplate.data,
        MOCK_USER_SESSION,
        undefined,
        progressTickCallback
      ).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("without share", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/update",
        '{"success":true}'
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      updateItem(
        "svc1234567890",
        itemTemplate.item,
        itemTemplate.data,
        MOCK_USER_SESSION,
        undefined,
        progressTickCallback
      ).then(
        () => {
          done();
        },
        () => done.fail()
      );
    });

    it("with public share", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/update",
        '{"success":true}'
      );
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/share",
        '{"success":true}'
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      updateItem(
        "svc1234567890",
        itemTemplate.item,
        itemTemplate.data,
        MOCK_USER_SESSION,
        "public",
        progressTickCallback
      ).then(
        () => {
          done();
        },
        () => done.fail()
      );
    });

    it("with org share", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/update",
        '{"success":true}'
      );
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/share",
        '{"success":true}'
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      updateItem(
        "svc1234567890",
        itemTemplate.item,
        itemTemplate.data,
        MOCK_USER_SESSION,
        "org",
        progressTickCallback
      ).then(
        () => {
          done();
        },
        () => done.fail()
      );
    });

    it("can handle share failure", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/update",
        '{"success":true}'
      );
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/share",
        mockItems.get400Failure()
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      updateItem(
        "svc1234567890",
        itemTemplate.item,
        itemTemplate.data,
        MOCK_USER_SESSION,
        "org",
        progressTickCallback
      ).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });
  });

  describe("updateItemURL", () => {
    it("should handle failure", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/0/update",
        mockItems.get400Failure()
      );

      updateItemURL("0", url, MOCK_USER_SESSION).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("should return update item id", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/0/update",
        '{"success":true}'
      );

      updateItemURL("0", url, MOCK_USER_SESSION).then(
        id => {
          expect(id).toEqual("0");
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("_countRelationships", () => {
    it("can handle empty layer array", () => {
      const layers: any[] = [];
      expect(_countRelationships(layers)).toEqual(0);
    });

    it("can handle layer with no relationships", () => {
      const layers: any[] = [
        {
          relationships: []
        }
      ];
      expect(_countRelationships(layers)).toEqual(0);
    });

    it("can handle layers with relationships", () => {
      const layers: any[] = [
        {
          relationships: [{}, {}]
        },
        {
          relationships: [{}]
        }
      ];
      expect(_countRelationships(layers)).toEqual(3);
    });
  });

  describe("_getCreateServiceOptions", () => {
    it("can get options for HOSTED empty service", done => {
      const userSession: UserSession = new UserSession({
        username: "jsmith",
        password: "123456"
      });

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: false,
        solutionItemId: "sol1234567890",
        initiative: initiative,
        ab766cba0dd44ec080420acc10990282: {},
        organization: { geometryServiceUrl: geometryServiceUrl }
      };

      itemTemplate.item.name = "A";
      itemTemplate.properties.service.spatialReference = {
        wkid: 102100
      };
      itemTemplate.itemId = "ab766cba0dd44ec080420acc10990282";

      _getCreateServiceOptions(
        itemTemplate,
        userSession,
        templateDictionary
      ).then(options => {
        expect(options).toEqual({
          item: {
            name: "A_sol1234567890",
            title: "A",
            capabilities: [],
            spatialReference: {
              wkid: 102100
            }
          },
          folderId: "aabb123456",
          params: {
            preserveLayerIds: true
          },
          preserveLayerIds: true,
          authentication: userSession
        });
        done();
      }, done.fail);
    });

    it("can get options for PORTAL empty service", done => {
      const userSession: UserSession = new UserSession({
        username: "jsmith",
        password: "123456"
      });

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: true,
        solutionItemId: "sol1234567890",
        initiative: initiative,
        ab766cba0dd44ec080420acc10990282: {},
        organization: { geometryServiceUrl: geometryServiceUrl }
      };

      itemTemplate.itemId = "ab766cba0dd44ec080420acc10990282";

      itemTemplate.properties.service.spatialReference = {
        wkid: 102100
      };

      _getCreateServiceOptions(
        itemTemplate,
        userSession,
        templateDictionary
      ).then(options => {
        expect(options).toEqual({
          item: {
            name: "undefined_sol1234567890",
            title: undefined,
            capabilities: "",
            spatialReference: {
              wkid: 102100
            }
          },
          folderId: "aabb123456",
          params: {
            preserveLayerIds: true
          },
          preserveLayerIds: true,
          authentication: userSession
        });
        done();
      }, done.fail);
    });

    it("can get options for HOSTED service with values", done => {
      const userSession: UserSession = new UserSession({
        username: "jsmith",
        password: "123456"
      });

      itemTemplate = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            hasViews: true, // should be skipped
            capabilities: ["Query"], // should be added to item and params
            spatialReference: {
              wkid: 102100
            }
          },
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {
          name: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: false,
        solutionItemId: "sol1234567890",
        initiative: initiative,
        ab766cba0dd44ec080420acc10990282: {},
        organization: { geometryServiceUrl: geometryServiceUrl }
      };

      fetchMock.post(
        "http://utility/geomServer/findTransformations/rest/info",
        '{"error":{"code":403,"message":"Access not allowed request","details":[]}}'
      );
      _getCreateServiceOptions(
        itemTemplate,
        userSession,
        templateDictionary
      ).then(options => {
        expect(options).toEqual({
          item: {
            name: "A_sol1234567890",
            title: "A",
            somePropNotInItem: true,
            capabilities: ["Query"],
            spatialReference: {
              wkid: 102100
            },
            hasViews: true
          },
          folderId: "aabb123456",
          params: {
            preserveLayerIds: true
          },
          preserveLayerIds: true,
          authentication: userSession
        });
        done();
      }, done.fail);
    });

    it("can get options for PORTAL service with values and unsupported capabilities", done => {
      const userSession: UserSession = new UserSession({
        username: "jsmith",
        password: "123456"
      });

      itemTemplate = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            isView: true,
            capabilities: "Query,CanEatWithChopsticks", // should be added to item and params
            spatialReference: {
              wkid: 102100
            }
          },
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {},
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: true,
        solutionItemId: "sol1234567890",
        initiative: initiative,
        ab766cba0dd44ec080420acc10990282: {},
        organization: { geometryServiceUrl: geometryServiceUrl }
      };

      fetchMock.post(
        "http://utility/geomServer/findTransformations/rest/info",
        '{"error":{"code":403,"message":"Access not allowed request","details":[]}}'
      );
      _getCreateServiceOptions(
        itemTemplate,
        userSession,
        templateDictionary
      ).then(options => {
        expect(options).toEqual({
          item: {
            name: options.item.name,
            title: undefined,
            somePropNotInItem: true,
            capabilities: "Query",
            isView: true,
            spatialReference: {
              wkid: 102100
            }
          },
          folderId: "aabb123456",
          params: {
            preserveLayerIds: true,
            isView: true
          },
          preserveLayerIds: true,
          authentication: userSession
        });
        done();
      }, done.fail);
    });

    it("can get options for HOSTED service with values when name contains guid", done => {
      const userSession: UserSession = new UserSession({
        username: "jsmith",
        password: "123456"
      });

      itemTemplate = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            hasViews: true, // should be skipped
            capabilities: ["Query"], // should be added to item and params
            spatialReference: {
              wkid: 102100
            }
          },
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {
          name: "A_0a25612a2fc54f6e8828c679e2300a49",
          title: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: false,
        solutionItemId: "sol1234567890",
        initiative: initiative,
        ab766cba0dd44ec080420acc10990282: {},
        organization: { geometryServiceUrl: geometryServiceUrl }
      };

      fetchMock.post(
        "http://utility/geomServer/findTransformations/rest/info",
        '{"error":{"code":403,"message":"Access not allowed request","details":[]}}'
      );
      _getCreateServiceOptions(
        itemTemplate,
        userSession,
        templateDictionary
      ).then(options => {
        expect(options).toEqual({
          item: {
            name: "A_sol1234567890",
            title: "A",
            somePropNotInItem: true,
            capabilities: ["Query"],
            spatialReference: {
              wkid: 102100
            },
            hasViews: true
          },
          folderId: "aabb123456",
          params: {
            preserveLayerIds: true
          },
          preserveLayerIds: true,
          authentication: userSession
        });
        done();
      }, done.fail);
    });

    it("can get options for HOSTED service with values and handle error on convertExtent", done => {
      const userSession: UserSession = new UserSession({
        username: "jsmith",
        password: "123456"
      });

      itemTemplate = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            hasViews: true, // should be skipped
            capabilities: ["Query"], // should be added to item and params
            spatialReference: {
              wkid: 4326
            }
          },
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {
          name: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: false,
        solutionItemId: "sol1234567890",
        initiative: initiative,
        ab766cba0dd44ec080420acc10990282: {},
        organization: { geometryServiceUrl: geometryServiceUrl }
      };

      fetchMock.post(
        geometryServiceUrl + "/findTransformations",
        mockItems.get400Failure()
      );

      fetchMock.post(
        "http://utility/geomServer/findTransformations/rest/info",
        '{"error":{"code":403,"message":"Access not allowed request","details":[]}}'
      );
      _getCreateServiceOptions(
        itemTemplate,
        userSession,
        templateDictionary
      ).then(done.fail, done);
    });
  });

  describe("_getRelationshipUpdates", () => {
    xit("_getRelationshipUpdates", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getUpdate", () => {
    xit("_getUpdate", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_setItemProperties", () => {
    it("can get options for HOSTED empty service", () => {
      const item: any = {
        isMultiServicesView: true,
        editorTrackingInfo: {
          enableEditorTracking: true
        }
      };
      const serviceInfo: any = {
        service: {
          capabilities: "Create"
        }
      };
      const params: any = {};

      const updatedItem: any = _setItemProperties(
        item,
        serviceInfo,
        params,
        false
      );
      expect(updatedItem).toEqual({
        isMultiServicesView: true,
        editorTrackingInfo: {
          enableEditorTracking: false
        },
        capabilities: "Create"
      });
      expect(params).toEqual({
        editorTrackingInfo: {
          enableEditorTracking: false
        }
      });
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------ //

function successfulFolderCreation(
  folderTitleRoot: string,
  suffix: number
): any {
  const folderName =
    folderTitleRoot + (suffix > 0 ? " " + suffix.toString() : "");
  return {
    success: true,
    folder: {
      id: "fld1234567890",
      title: folderName,
      username: "casey"
    }
  };
}

function failedFolderCreation(folderTitleRoot: string, suffix: number): any {
  const folderName =
    folderTitleRoot + (suffix > 0 ? " " + suffix.toString() : "");
  return {
    error: {
      code: 400,
      message: "Unable to create folder.",
      details: ["Folder title '" + folderName + "' not available."]
    }
  };
}
