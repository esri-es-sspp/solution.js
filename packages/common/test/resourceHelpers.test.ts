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
 * Provides tests for common functions involving the management of item and group resources.
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as interfaces from "../src/interfaces";
import * as request from "@esri/arcgis-rest-request";
import * as resourceHelpers from "../src/resourceHelpers";

import * as utils from "./mocks/utils";
import * as mockItems from "./mocks/agolItems";
import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `resourceHelpers`: common functions involving the management of item and group resources", () => {
  // Set up a UserSession to use in all of these tests
  const MOCK_USER_SESSION = new interfaces.UserSession({
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

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

  afterEach(() => {
    fetchMock.restore();
  });

  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    describe("addMetadataFromBlob", () => {
      it("has metadata", done => {
        const blob = utils.getSampleMetadata();
        const itemId = "itm1234567890";
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";
        const expected = { success: true, id: itemId };

        fetchMock.post(updateUrl, expected);
        resourceHelpers
          .addMetadataFromBlob(blob, itemId, MOCK_USER_SESSION)
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(typeof fetchBody).toEqual("object");
            done();
          }, done.fail);
      });
    });

    describe("addResourceFromBlob", () => {
      it("has filename without folder", done => {
        const blob = utils.getSampleMetadata();
        const itemId = "itm1234567890";
        const folder = "";
        const filename = "aFilename.xml";
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/addResources";
        const expected = { success: true, id: itemId };

        fetchMock.post(updateUrl, expected);
        resourceHelpers
          .addResourceFromBlob(
            blob,
            itemId,
            folder,
            filename,
            MOCK_USER_SESSION
          )
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(typeof fetchBody).toEqual("object");
            const form = fetchBody as FormData;
            expect(form.get("fileName")).toEqual(filename);
            done();
          }, done.fail);
      });

      it("has a filename without an extension", done => {
        const blob = utils.getSampleMetadata();
        const itemId = "itm1234567890";
        const folder = "aFolder";
        const filename = "aFilename";
        const expected = new request.ArcGISAuthError(
          "Filename must have an extension indicating its type"
        );

        resourceHelpers
          .addResourceFromBlob(
            blob,
            itemId,
            folder,
            filename,
            MOCK_USER_SESSION
          )
          .then(
            () => done.fail(),
            (response: any) => {
              expect(response).toEqual(expected);
              done();
            }
          );
      });

      it("has filename with folder", done => {
        const blob = utils.getSampleMetadata();
        const itemId = "itm1234567890";
        const folder = "aFolder";
        const filename = "aFilename.xml";
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/addResources";
        const expected = { success: true, id: itemId };

        fetchMock.post(updateUrl, expected);
        resourceHelpers
          .addResourceFromBlob(
            blob,
            itemId,
            folder,
            filename,
            MOCK_USER_SESSION
          )
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(typeof fetchBody).toEqual("object");
            const form = fetchBody as FormData;
            expect(form.get("resourcesPrefix")).toEqual(folder);
            expect(form.get("fileName")).toEqual(filename);
            done();
          }, done.fail);
      });
    });

    describe("addThumbnailFromBlob", () => {
      it("has thumbnail", done => {
        const blob = utils.getSampleImage();
        const itemId = "itm1234567890";
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";
        const expected = { success: true, id: itemId };

        fetchMock.post(updateUrl, expected);
        resourceHelpers
          .addThumbnailFromBlob(blob, itemId, MOCK_USER_SESSION)
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(typeof fetchBody).toEqual("object");
            done();
          }, done.fail);
      });
    });

    describe("addThumbnailFromUrl", () => {
      it("has thumbnail", done => {
        const thumbnailUrl = "https://myserver/images/thumbnail.png";
        const itemId = "itm1234567890";
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";

        const expected = { success: true, id: itemId };
        const expectedImage = mockItems.getAnImageResponse();

        fetchMock.post(updateUrl, expected).post(thumbnailUrl, expectedImage);
        resourceHelpers
          .addThumbnailFromUrl(thumbnailUrl, itemId, MOCK_USER_SESSION)
          .then((response: any) => {
            expect(response).toEqual(expected);
            const options: fetchMock.MockOptions = fetchMock.lastOptions(
              updateUrl
            );
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            expect(typeof fetchBody).toEqual("object");
            done();
          }, done.fail);
      });
    });
  }

  describe("copyFilesFromStorageItem", () => {
    it("empty files list", done => {
      const storageAuthentication = MOCK_USER_SESSION;
      const filePaths: interfaces.IDeployFileCopyPath[] = [] as interfaces.IDeployFileCopyPath[];
      const destinationItemId: string = "itm1234567890";
      const destinationAuthentication = MOCK_USER_SESSION;
      const expected = true;

      resourceHelpers
        .copyFilesFromStorageItem(
          storageAuthentication,
          filePaths,
          destinationItemId,
          destinationAuthentication
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("single metadata file to copy", done => {
        const storageAuthentication = MOCK_USER_SESSION;
        const filePaths: interfaces.IDeployFileCopyPath[] = [
          {
            type: interfaces.EFileType.Metadata,
            folder: "",
            filename: "",
            url: "https://myserver/doc/metadata.xml" // Metadata uses only URL
          }
        ];
        const destinationItemId: string = "itm1234567890";
        const destinationAuthentication = MOCK_USER_SESSION;
        const serverInfoUrl = "https://myserver/doc/metadata.xml/rest/info";
        const expectedServerInfo = SERVER_INFO;
        const fetchUrl = "https://myserver/doc/metadata.xml";
        const expectedFetch = new Blob(
          ["<meta><value1>a</value1><value2>b</value2></meta>"],
          { type: "text/xml" }
        );
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";
        const expectedUpdate = true;

        fetchMock
          .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
          .post(serverInfoUrl, expectedServerInfo)
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, expectedUpdate);
        resourceHelpers
          .copyFilesFromStorageItem(
            storageAuthentication,
            filePaths,
            destinationItemId,
            destinationAuthentication
          )
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });

      it("single resource file to copy", done => {
        const storageAuthentication = MOCK_USER_SESSION;
        const filePaths: interfaces.IDeployFileCopyPath[] = [
          {
            type: interfaces.EFileType.Resource,
            folder: "storageFolder",
            filename: "storageFilename.png",
            url: "https://myserver/images/resource.png"
          }
        ];
        const destinationItemId: string = "itm1234567890";
        const destinationAuthentication = MOCK_USER_SESSION;
        const serverInfoUrl = "https://myserver/images/resource.png/rest/info";
        const expectedServerInfo = SERVER_INFO;
        const fetchUrl = "https://myserver/images/resource.png";
        const expectedFetch = mockItems.getAnImageResponse();
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/addResources";
        const expectedUpdate = true;

        fetchMock
          .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
          .post(serverInfoUrl, expectedServerInfo)
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, expectedUpdate);
        resourceHelpers
          .copyFilesFromStorageItem(
            storageAuthentication,
            filePaths,
            destinationItemId,
            destinationAuthentication
          )
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });

      it("single thumbnail file to copy", done => {
        const storageAuthentication = MOCK_USER_SESSION;
        const filePaths: interfaces.IDeployFileCopyPath[] = [
          {
            type: interfaces.EFileType.Thumbnail,
            folder: "",
            filename: "",
            url: "https://myserver/images/thumbnail.png" // Thumbnail uses only URL
          }
        ];
        const destinationItemId: string = "itm1234567890";
        const destinationAuthentication = MOCK_USER_SESSION;
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";
        const expectedUpdate = true;
        const expectedImage = mockItems.getAnImageResponse();
        const imageUrl: string = "https://myserver/images/thumbnail.png";

        fetchMock.post(updateUrl, expectedUpdate).post(imageUrl, expectedImage);
        resourceHelpers
          .copyFilesFromStorageItem(
            storageAuthentication,
            filePaths,
            destinationItemId,
            destinationAuthentication
          )
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });
    }
  });

  describe("copyFilesToStorageItem", () => {
    it("empty files list", done => {
      const sourceUserSession = MOCK_USER_SESSION;
      const filePaths: interfaces.ISourceFileCopyPath[] = [] as interfaces.ISourceFileCopyPath[];
      const storageItemId: string = "itm1234567890";
      const storageAuthentication = MOCK_USER_SESSION;
      const expected: string[] = [];

      resourceHelpers
        .copyFilesToStorageItem(
          sourceUserSession,
          filePaths,
          storageItemId,
          storageAuthentication
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("single file to copy", done => {
        const sourceUserSession = MOCK_USER_SESSION;
        const filePaths: interfaces.ISourceFileCopyPath[] = [
          {
            folder: "storageFolder",
            filename: "storageFilename.png",
            url: "https://myserver/images/thumbnail.png"
          }
        ];
        const storageItemId: string = "itm1234567890";
        const storageAuthentication = MOCK_USER_SESSION;
        const serverInfoUrl = "https://myserver/images/thumbnail.png/rest/info";
        const expectedServerInfo = SERVER_INFO;
        const fetchUrl = "https://myserver/images/thumbnail.png";
        const expectedFetch = mockItems.getAnImageResponse();
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/addResources";
        const expectedUpdate: string[] = ["storageFolder/storageFilename.png"];

        fetchMock
          .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
          .post(serverInfoUrl, expectedServerInfo)
          .post(fetchUrl, expectedFetch)
          .post(updateUrl, expectedUpdate);
        resourceHelpers
          .copyFilesToStorageItem(
            sourceUserSession,
            filePaths,
            storageItemId,
            storageAuthentication
          )
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });
    }
  });

  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    describe("copyMetadata", () => {
      it("copies metadata.xml", done => {
        const source = {
          url:
            "https://www.arcgis.com/sharing/content/items/c6732556e299f1/info/metadata/metadata.xml",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          authentication: MOCK_USER_SESSION
        };

        const fetchUrl =
          "https://www.arcgis.com/sharing/content/items/c6732556e299f1/info/metadata/metadata.xml";
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";
        const expectedFetch = utils.getSampleMetadata();
        const expectedUpdate = { success: true, id: destination.itemId };
        fetchMock
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, expectedUpdate);

        resourceHelpers
          .copyMetadata(source, destination)
          .then((response: any) => {
            expect(response).toEqual(expectedUpdate);
            done();
          }, done.fail);
      });

      it("handles inability to get metadata.xml", done => {
        const source = {
          url:
            "https://www.arcgis.com/sharing/content/items/c6732556e299f1/info/metadata/metadata.xml",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          authentication: MOCK_USER_SESSION
        };

        const fetchUrl =
          "https://www.arcgis.com/sharing/content/items/c6732556e299f1/info/metadata/metadata.xml";
        const expectedFetch = {
          error: {
            code: 400,
            messageCode: "CONT_0036",
            message: "Item info file does not exist or is inaccessible.",
            details: ["Error getting Item Info from DataStore"]
          }
        };
        fetchMock.post(fetchUrl, expectedFetch);
        resourceHelpers.copyMetadata(source, destination).then(response => {
          response.success ? done.fail() : done();
        }, done);
      });

      it("handles inability to get metadata.xml, hard error", done => {
        const source = {
          url:
            "https://www.arcgis.com/sharing/content/items/c6732556e299f1/info/metadata/metadata.xml",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          authentication: MOCK_USER_SESSION
        };

        const fetchUrl =
          "https://www.arcgis.com/sharing/content/items/c6732556e299f1/info/metadata/metadata.xml";
        fetchMock.post(fetchUrl, 500);
        resourceHelpers.copyMetadata(source, destination).then(response => {
          response.success ? done.fail() : done();
        }, done);
      });

      it("handles inability to store metadata.xml", done => {
        const source = {
          url:
            "https://www.arcgis.com/sharing/content/items/c6732556e299f1/info/metadata/metadata.xml",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          authentication: MOCK_USER_SESSION
        };

        const fetchUrl =
          "https://www.arcgis.com/sharing/content/items/c6732556e299f1/info/metadata/metadata.xml";
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";
        const expectedFetch = utils.getSampleMetadata();
        const expectedUpdate = { success: false, id: destination.itemId };
        fetchMock
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, expectedUpdate);
        resourceHelpers.copyMetadata(source, destination).then(
          response => {
            response.success ? done.fail() : done();
          },
          () => done()
        );
      });

      it("handles inability to store metadata.xml, hard error", done => {
        const source = {
          url:
            "https://www.arcgis.com/sharing/content/items/c6732556e299f1/info/metadata/metadata.xml",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          authentication: MOCK_USER_SESSION
        };

        const fetchUrl =
          "https://www.arcgis.com/sharing/content/items/c6732556e299f1/info/metadata/metadata.xml";
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update";
        const expectedFetch = utils.getSampleMetadata();
        const expectedUpdate = 500;
        fetchMock
          .post(fetchUrl, expectedFetch, { sendAsJson: false })
          .post(updateUrl, expectedUpdate);
        resourceHelpers.copyMetadata(source, destination).then(
          response => {
            response.success ? done.fail() : done();
          },
          () => done()
        );
      });
    });

    describe("copyResource", () => {
      it("copies resource", done => {
        const source = {
          url:
            "https://www.arcgis.com/sharing/content/items/c6732556e299f1/resources/image.png",
          authentication: MOCK_USER_SESSION
        };
        const destination = {
          itemId: "itm1234567890",
          folder: "storageFolder",
          filename: "storageFilename.png",
          authentication: MOCK_USER_SESSION
        };
        const fetchUrl =
          "https://www.arcgis.com/sharing/content/items/c6732556e299f1/resources/image.png";
        const updateUrl =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/addResources";
        const expected = { success: true, id: destination.itemId };

        fetchMock
          .post(fetchUrl, utils.getSampleImage(), { sendAsJson: false })
          .post(updateUrl, expected);
        resourceHelpers
          .copyResource(source, destination)
          .then((response: any) => {
            expect(response).toEqual(expected);
            done();
          }, done.fail);
      });
    });

    it("handles inexplicable response", done => {
      const source = {
        url:
          "https://www.arcgis.com/sharing/content/items/c6732556e299f1/resources/image.png",
        authentication: MOCK_USER_SESSION
      };
      const destination = {
        itemId: "itm1234567890",
        folder: "storageFolder",
        filename: "storageFilename.png",
        authentication: MOCK_USER_SESSION
      };
      const fetchUrl =
        "https://www.arcgis.com/sharing/content/items/c6732556e299f1/resources/image.png";

      fetchMock.post(
        fetchUrl,
        new Blob(["[1, 2, 3, 4, ]"], { type: "text/plain" }),
        { sendAsJson: false }
      );
      resourceHelpers.copyResource(source, destination).then(done.fail, done);
    });

    it("handles inability to get resource", done => {
      const source = {
        url:
          "https://www.arcgis.com/sharing/content/items/c6732556e299f1/resources/image.png",
        authentication: MOCK_USER_SESSION
      };
      const destination = {
        itemId: "itm1234567890",
        folder: "storageFolder",
        filename: "storageFilename.png",
        authentication: MOCK_USER_SESSION
      };
      const fetchUrl =
        "https://www.arcgis.com/sharing/content/items/c6732556e299f1/resources/image.png";

      fetchMock.post(fetchUrl, 500);
      resourceHelpers.copyResource(source, destination).then(done.fail, done);
    });

    it("handles inability to copy resource, hard error", done => {
      const source = {
        url:
          "https://www.arcgis.com/sharing/content/items/c6732556e299f1/resources/image.png",
        authentication: MOCK_USER_SESSION
      };
      const destination = {
        itemId: "itm1234567890",
        folder: "storageFolder",
        filename: "storageFilename.png",
        authentication: MOCK_USER_SESSION
      };
      const fetchUrl =
        "https://www.arcgis.com/sharing/content/items/c6732556e299f1/resources/image.png";
      const updateUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/addResources";
      const expected = 500;

      fetchMock
        .post(fetchUrl, utils.getSampleImage(), { sendAsJson: false })
        .post(updateUrl, expected);
      resourceHelpers.copyResource(source, destination).then(done.fail, done);
    });
  }

  describe("generateGroupFilePaths", () => {
    it("generates paths for a group thumbnail", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail.png";
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/community/groups/8f7ec78195d0479784036387d522e29f/info/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateGroupFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("handles the absence of a group thumbnail", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "";
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateGroupFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart
      );
      expect(actual.length).toEqual(0);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateMetadataStorageFilename", () => {
    it("metadata", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
        filename: "metadata.xml"
      };

      const actual = resourceHelpers.generateMetadataStorageFilename(itemId);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateResourceFilenameFromStorage", () => {
    it("top-level image file", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f/gtnp2.jpg";
      const expected: interfaces.IDeployFilename = {
        type: interfaces.EFileType.Resource,
        folder: "",
        filename: "gtnp2.jpg"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("image file in folder", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_aFolder/git_merge.png";
      const expected: interfaces.IDeployFilename = {
        type: interfaces.EFileType.Resource,
        folder: "aFolder",
        filename: "git_merge.png"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("metadata file", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml";
      const expected: interfaces.IDeployFilename = {
        type: interfaces.EFileType.Metadata,
        folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
        filename: "metadata.xml"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("thumbnail", () => {
      const storageResourceFilename =
        "8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png";
      const expected: interfaces.IDeployFilename = {
        type: interfaces.EFileType.Thumbnail,
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail.png"
      };

      const actual = resourceHelpers.generateResourceFilenameFromStorage(
        storageResourceFilename
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateResourceStorageFilename", () => {
    it("top-level", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "gtnp2.jpg";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f",
        filename: "gtnp2.jpg"
      };

      const actual = resourceHelpers.generateResourceStorageFilename(
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("in folder", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "aFolder/git_merge.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_aFolder",
        filename: "git_merge.png"
      };

      const actual = resourceHelpers.generateResourceStorageFilename(
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceFilePaths", () => {
    it("without resources", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames: string[] = [];
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(2);
      expect(actual).toEqual(expected);
    });

    it("with one resource at top level", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames = ["gtnp2.jpg"];
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(3);
      expect(actual).toEqual(expected);
    });

    it("with one resource in folder", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames = ["myFolder/gtnp2.jpg"];
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f_myFolder",
          filename: "gtnp2.jpg"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(3);
      expect(actual).toEqual(expected);
    });

    it("with multiple resources", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const resourceFilenames = ["gtnp2.jpg", "myFolder/gtnp2.jpg"];
      const expected: interfaces.ISourceFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f",
          filename: "gtnp2.jpg"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/myFolder/gtnp2.jpg",
          folder: "8f7ec78195d0479784036387d522e29f_myFolder",
          filename: "gtnp2.jpg"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml"
        },
        {
          url:
            "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/info/thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png"
        }
      ];

      const actual = resourceHelpers.generateSourceFilePaths(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        resourceFilenames
      );
      expect(actual.length).toEqual(4);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceMetadataUrl", () => {
    it("item", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const expected =
        "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/metadata/metadata.xml";

      const actual = resourceHelpers.generateSourceMetadataUrl(
        portalSharingUrl,
        itemId
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceResourceUrl", () => {
    it("top-level", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "gtnp2.jpg";
      const expected =
        "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/gtnp2.jpg";

      const actual = resourceHelpers.generateSourceResourceUrl(
        portalSharingUrl,
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("in folder", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "aFolder/git_merge.png";
      const expected =
        "https://www.arcgis.com/sharing/content/items/8f7ec78195d0479784036387d522e29f/resources/aFolder/git_merge.png";

      const actual = resourceHelpers.generateSourceResourceUrl(
        portalSharingUrl,
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateSourceThumbnailUrl", () => {
    it("item", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const thumbnailUrlPart = "thumbnail/thumbnail.png";
      const expected =
        "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/info/thumbnail/thumbnail.png";

      const actual = resourceHelpers.generateSourceThumbnailUrl(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart
      );
      expect(actual).toEqual(expected);
    });

    it("group", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const itemId = "b6430e0ca08d4b1380f3a5908985da3c";
      const thumbnailUrlPart = "thumbnail1553812391084.png";
      const isGroup = true;
      const expected =
        "https://www.arcgis.com/sharing/community/groups/b6430e0ca08d4b1380f3a5908985da3c/info/thumbnail1553812391084.png";

      const actual = resourceHelpers.generateSourceThumbnailUrl(
        portalSharingUrl,
        itemId,
        thumbnailUrlPart,
        isGroup
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("generateStorageFilePaths", () => {
    it("generates paths without resources", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [];
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(0);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a single top-level file resource", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f/gtnp2.jpg"
      ];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f/gtnp2.jpg",
          folder: "",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a single file resource in a folder", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f_myFolder/gtnp2.jpg"
      ];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_myFolder/gtnp2.jpg",
          folder: "myFolder",
          filename: "gtnp2.jpg",
          type: interfaces.EFileType.Resource
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with metadata", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml"
      ];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_info_metadata/metadata.xml",
          folder: "8f7ec78195d0479784036387d522e29f_info_metadata",
          filename: "metadata.xml",
          type: interfaces.EFileType.Metadata
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("generates paths with a thumbnail", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames: string[] = [
        "8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png"
      ];
      const expected: interfaces.IDeployFileCopyPath[] = [
        {
          url:
            "https://www.arcgis.com/sharing/content/items/03744d6b7a9b4b76bfd45dc2d1e642a5/resources/8f7ec78195d0479784036387d522e29f_info_thumbnail/thumbnail.png",
          folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
          filename: "thumbnail.png",
          type: interfaces.EFileType.Thumbnail
        }
      ];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(expected);
    });

    it("handles the absence of resource filenames", () => {
      const portalSharingUrl = "https://www.arcgis.com/sharing";
      const storageItemId = "03744d6b7a9b4b76bfd45dc2d1e642a5";
      const resourceFilenames = null as string[];
      const expected: interfaces.IDeployFileCopyPath[] = [];

      const actual = resourceHelpers.generateStorageFilePaths(
        portalSharingUrl,
        storageItemId,
        resourceFilenames
      );
      expect(actual.length).toEqual(0);
      expect(actual).toEqual(expected);
    });
  });

  describe("generateThumbnailStorageFilename", () => {
    it("without subpath", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "thumbnail1553812391084.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail1553812391084.png"
      };

      const actual = resourceHelpers.generateThumbnailStorageFilename(
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });

    it("with subpath", () => {
      const itemId = "8f7ec78195d0479784036387d522e29f";
      const sourceResourceFilename = "thumbnail/thumbnail.png";
      const expected = {
        folder: "8f7ec78195d0479784036387d522e29f_info_thumbnail",
        filename: "thumbnail.png"
      };

      const actual = resourceHelpers.generateThumbnailStorageFilename(
        itemId,
        sourceResourceFilename
      );
      expect(actual).toEqual(expected);
    });
  });
});
