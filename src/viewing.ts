/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import * as common from "./common";
import { IFullItem } from "./fullItem";
import { IItemHash } from "./fullItemHierarchy";

//-- Exports ---------------------------------------------------------------------------------------------------------//

/**
 * A recursive structure describing the hierarchy of a collection of AGOL items.
 */
export interface IHierarchyEntry {
  /**
   * AGOL item id
   */
  id: string,
  /**
   * Item's dependencies
   */
  dependencies: IHierarchyEntry[]
}

export function getTopLevelItemIds (
  items: IItemHash
): string[] {
  // Find the top-level nodes. Start with all nodes, then remove those that other nodes depend on
  let topLevelItemCandidateIds:string[] = Object.keys(items);
  Object.keys(items).forEach(function (id) {
    ((items[id] as IFullItem).dependencies || []).forEach(function (dependencyId) {
      let iNode = topLevelItemCandidateIds.indexOf(dependencyId);
      if (iNode >= 0) {
        // Node is somebody's dependency, so remove the node from the list of top-level nodes
        // If iNode == -1, then it's a shared dependency and it has already been removed
        topLevelItemCandidateIds.splice(iNode, 1);
      }
    });
  });
  return topLevelItemCandidateIds;
}

/**
 * Extracts item hierarchy structure from a Solution's items list.
 *
 * @param items Hash of JSON descriptions of items
 * @returns JSON structure reflecting dependency hierarchy of items; shared dependencies are
 * repeated; each element of the structure contains the AGOL id of an item and a list of ids of the
 * item's dependencies
 */
export function getItemHierarchy (
  items: IItemHash
): IHierarchyEntry[] {
  let hierarchy:IHierarchyEntry[] = [];

  // Find the top-level nodes. Start with all nodes, then remove those that other nodes depend on
  let topLevelItemIds = getTopLevelItemIds(items);

  // Hierarchically list the children of specified nodes
  function itemChildren(children:string[], hierarchy:IHierarchyEntry[]): void {
    // Visit each child
    children.forEach(function (id) {
      let child:IHierarchyEntry = {
        id: id,
        dependencies: []
      };

      // Fill in the child's dependencies array with any of its children
      let dependencyIds = (items[id] as IFullItem).dependencies;
      if (Array.isArray(dependencyIds) && dependencyIds.length > 0) {
        itemChildren(dependencyIds, child.dependencies);
      }

      hierarchy.push(child);
    });
  }

  itemChildren(topLevelItemIds, hierarchy);
  return hierarchy;
}

export function createSolutionStorymap (
  title: string,
  solution: IItemHash,
  orgSession: common.IOrgSession,
  folderId = null as string,
  access = "private"
): Promise<IFullItem> {
  return new Promise((resolve, reject) => {
    publishSolutionStorymapItem(createSolutionStorymapItem(title, solution, folderId), orgSession, folderId, access)
    .then(
      storymap  => resolve(storymap),
      reject
    );
  });
}

//-- Internals -------------------------------------------------------------------------------------------------------//

export function createSolutionStorymapItem (
  title: string,
  solution: IItemHash,
  folderId = null as string
): IFullItem {
  // Prepare the storymap item
  let item = getStorymapItemFundamentals(title);
  let data = getStorymapItemDataFundamentals(title, folderId);

  // Create a story for each top-level item
  let topLevelItemIds:string[] = getTopLevelItemIds(solution);
  let stories = data.values.story.entries;
  topLevelItemIds.forEach(
    topLevelItemId => {
      let solutionItem = solution[topLevelItemId] as IFullItem;
      if (solutionItem.item.url) {
        let itsStory = getWebpageStory(solutionItem.item.title, solutionItem.item.description, solutionItem.item.url);
        stories.push(itsStory);
      }
    }
  );

  return {
    type: item.type,
    item: item,
    data: data
  };
}

function getStorymapItemDataFundamentals (
  title: string,
  folderId: string
): any {
    return {
    "source": "32f733be56ce48b5993932715e1070ee",
    "folderId": folderId,
    "values": {
      "settings": {
        "layout": {
          "id": "accordion"
        },
        "layoutOptions": {
          "description": true,
          "legend": "dropdown",
          "panel": {
            "position": "left",
            "size": "medium"
          },
          "numbering": true,
          "reverse": false
        },
        "theme": {
          "colors": {
            "name": "accordion-org",
            "accordionNumber": "#004da8",
            "accordionTitle": "#004da8",
            "accordionArrowActive": "#004da8",
            "accordionArrow": "rgba(0, 77, 168, 0.6)",
            "accordionArrowHover": "rgba(0, 77, 168, 0.8)",
            "group": "org",
            "themeMajor": "black",
            "header": "#999999",
            "headerText": "#242424",
            "headerTitle": "#242424",
            "panel": "#ebebeb",
            "text": "#474747",
            "textLink": "#004da8",
            "media": "#eee",
            "mapControls": "#ebebeb",
            "softText": "#474747",
            "softBtn": "#474747",
            "esriLogo": "black",
            "esriLogoMobile": "black"
          }
        },
        "appGeocoders": [{
          "singleLineFieldName": "SingleLine",
          "name": "ArcGIS World Geocoding Service",
          "url": "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
        }]
      },
      "title": title,
      "story": {
        "storage": "WEBAPP",
        "entries": []
      },
      "template": {
        "name": "Map Series",
        "createdWith": "1.13.0",
        "editedWith": "1.13.0"
      }
    },
    "_ssl": null
  };
}

export function getStorymapItemFundamentals (
  title = ""
): any {
  return {
    "itemType": "text",
    "name": null,
    "title": title,
    "type": "Web Mapping Application",
    "typeKeywords": ["JavaScript", "layout-accordion", "Map", "Mapping Site", "mapseries", "Online Map",
      "Ready To Use", "selfConfigured", "Story Map", "Story Maps", "Web Map"],
    "tags": ["Solutions"],
    "commentsEnabled": false
  };
}

function getWebpageStory (
  title: string,
  description: string,
  url: string
): any {
  return {
    "title": title,
    "contentActions": [],
    "creaDate": 1542325264964,
    "status": "PUBLISHED",
    "media": {
      "type": "webpage",
      "webpage": {
        "url": url,
        "type": "webpage",
        "altText": "",
        "display": "stretch",
        "unload": true
      }
    },
    "description": "<p>" + description + "</p>\n"
  }
}

/**
 * Creates a Storymap item describing the top-level webpages forming the solution.
 *
 * @param solutionStorymap Storymap AGOL item; item is modified
 * @param orgSession Options for requesting information from AGOL, including org and portal URLs
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 * folder
 * @param access Access to set for item: 'public', 'org', 'private'
 * @returns A promise that will resolve with an updated solutionStorymap reporting the Storymap id
 * and URL
 * @protected
 */
export function publishSolutionStorymapItem (
  solutionStorymap: IFullItem,
  orgSession: common.IOrgSession,
  folderId = null as string,
  access = "private"
): Promise<IFullItem> {
  return new Promise((resolve, reject) => {
    common.createItemWithData(solutionStorymap.item, solutionStorymap.data, orgSession, folderId, access)
    .then(
      createResponse => {
        // Update its app URL
        let solutionStorymapId = createResponse.id;
        let solutionStorymapUrl = orgSession.orgUrl + "/apps/MapSeries/index.html?appid=" + solutionStorymapId;
        common.updateItemURL(solutionStorymapId, solutionStorymapUrl, orgSession)
        .then(
          () => {
            solutionStorymap.item.id = solutionStorymapId;
            solutionStorymap.item.url = solutionStorymapUrl;
            resolve(solutionStorymap);
          },
          reject
        );

      },
      reject
    );
  });
}
