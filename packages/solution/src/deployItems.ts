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
 * Manages deployment of items via the REST API.
 *
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
import * as generalHelpers from "./generalHelpers";
import * as interfaces from "./interfaces";
import * as restHelpers from "./restHelpers";
import * as templatization from "./templatization";

/**
 *
 * @param templates A collection of AGO item templates
 * @param templateDictionary Hash of facts: org URL, adlib replacements
 * @param userSession Options for the request
 * @param progressTickCallback Function for reporting progress updates from type-specific template handlers
 * @return A promise that will resolve with the item's template (which is simply returned if it's
 *         already in the templates list
 */
export function deployItems(
  templates: interfaces.IItemTemplate[],
  templateDictionary: any,
  userSession: auth.UserSession,
  progressTickCallback: () => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (templates.length > 0) {
      // Create an ordered graph of the templates so that dependencies are created
      // before the items that need them
      const cloneOrderChecklist: string[] = topologicallySortItems(templates);

      // For each item in order from no dependencies to dependent on other items,
      //   * replace template symbols using template dictionary
      //   * create item in destination group
      //   * add created item's id into the template dictionary
      const awaitAllItems = [] as Array<Promise<interfaces.IItemTemplate>>;
      cloneOrderChecklist.forEach(id =>
        awaitAllItems.push(
          createItemFromTemplateWhenReady(
            id,
            templates,
            templateDictionary,
            userSession,
            progressTickCallback
          )
        )
      );

      // Wait until all items have been created
      Promise.all(awaitAllItems).then(
        clonedSolutionItems => {
          resolve(clonedSolutionItems);
        },
        generalHelpers.fail
      );
    }
    resolve(templateDictionary);
  });
}


/**
 * Fetches an AGO item and converts it into a template after its dependencies have been fetched and
 * converted.
 *
 * @param itemId AGO id of solution template item to deploy
 * @param templates A collection of AGO item templates
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 * @param userSession Options for the request
 * @param progressTickCallback Function for reporting progress updates from type-specific template handlers
 * @return A promise that will resolve with the item's template (which is simply returned if it's
 *         already in the templates list
 * @protected
 */
function createItemFromTemplateWhenReady(
  itemId: string,
  templates: interfaces.IItemTemplate[],
  templateDictionary: any,
  userSession: auth.UserSession,
  progressTickCallback: () => void
): Promise<interfaces.IItemTemplate> {
  console.log("enqueue item #" + itemId);
  templateDictionary[itemId] = {};
  const itemDef = new Promise<interfaces.IItemTemplate>((resolve, reject) => {
    const template = findTemplateInList(templates, itemId);
    if (!template) {
      reject(generalHelpers.fail());
    }

    // Wait until all of the item's dependencies are deployed
    const awaitDependencies = [] as Array<Promise<interfaces.IItemTemplate>>;
    console.log("item #" + itemId + " depends on:");
    (template!.dependencies || []).forEach(dependencyId => {
      awaitDependencies.push(templateDictionary[dependencyId].def)
      console.log("    " + dependencyId);}
    );
    Promise.all(awaitDependencies).then(
      () => {
        console.log("create item #" + itemId);
        for(let i = 0; i < template!.estimatedDeploymentCostFactor; ++i) {
          progressTickCallback();
        }
        templateDictionary[itemId].id = itemId;

        /*
        const moduleName = "@esri/solution-simple-types";
        import(moduleName)
        .then(
          myModule => {
            console.log("Called module " + (myModule as interfaces.IItemJson).toJSON(moduleName));
          },
          error => {
            console.warn("Unable to import module " + moduleName + ": " + JSON.stringify(error));
          }
        )
        */



        resolve(template || undefined);


        /*

        createItemWithDataAndResourcesPartial = createItemWithDataAndResources(userSession)

        map item type to package
        package.fromJSON(
          templatization.replaceInTemplate(template, templateDictionary),
          createItemWithDataAndResourcesPartial
        )





        /*
        // Prepare template
        let itemTemplate = mClassifier.initItemTemplateFromJSON(
          findTemplateInList(templates, itemId)
        );

        // Interpolate it
        itemTemplate.dependencies = itemTemplate.dependencies
          ? (mCommon.templatize(itemTemplate.dependencies) as string[])
          : [];

        itemTemplate = templatization.replaceInTemplate(itemTemplate, templateDictionary),
        */



        /*restHelpers.createItemWithDataAndResources(
          {
            ...itemInfo
          },
          templatization.replaceInTemplate(itemData, updatedTemplateDictionary),
          {
            authentication: userSession
          },
          templateDictionary.folderId
        )*/


        /*
        // Deploy it
        itemTemplate.fcns
          .createItemFromTemplate(
            itemTemplate,
            templateDictionary,
            userSession,
            progressTickCallback
          )
          .then(
            itemClone => resolve(itemClone),
            generalHelpers.fail
          )
          */

      },
      generalHelpers.fail
    );
  });

  // Save the deferred for the use of items that depend on this item being created first
  templateDictionary[itemId].def = itemDef;
  return itemDef;
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * A vertex used in the topological sort algorithm.
 * @protected
 */
interface ISortVertex {
  /**
   * Vertex (AGO) id and its visited status, described by the SortVisitColor enum
   */
  [id: string]: number;
}

/**
 * A visit flag used in the topological sort algorithm.
 * @protected
 */
enum SortVisitColor {
  /** not yet visited */
  White,
  /** visited, in progress */
  Gray,
  /** finished */
  Black
}

/**
 * Finds index of template by id in a list of templates.
 *
 * @param templates A collection of AGO item templates to search
 * @param id AGO id of template to find
 * @return Id of matching template or -1 if not found
 * @protected
 */
function findTemplateIndexInSolution(
  templates: interfaces.IItemTemplate[],
  id: string
): number {
  const baseId = id;
  return templates.findIndex(template => {
    return baseId === template.itemId;
  });
}

/**
 * Finds template by id in a list of templates.
 *
 * @param templates A collection of AGO item templates to search
 * @param id AGO id of template to find
 * @return Matching template or null
 */
export function findTemplateInList(
  templates: interfaces.IItemTemplate[],
  id: string
): interfaces.IItemTemplate | null {
  const childId = findTemplateIndexInSolution(templates, id);
  return childId >= 0 ? templates[childId] : null;
}

/**
 * Topologically sort a list of items into a build list.
 *
 * @param templates A collection of AGO item templates
 * @return List of ids of items in the order in which they need to be built so that dependencies
 * are built before items that require those dependencies
 * @throws Error("Cyclical dependency graph detected")
 * @protected
 */
function topologicallySortItems(
  templates: interfaces.IItemTemplate[]
): string[] {
  // Cormen, Thomas H.; Leiserson, Charles E.; Rivest, Ronald L.; Stein, Clifford (2009)
  // Sections 22.3 (Depth-first search) & 22.4 (Topological sort), pp. 603-615
  // Introduction to Algorithms (3rd ed.), The MIT Press, ISBN 978-0-262-03384-8
  //
  // DFS(G)
  // 1 for each vertex u ∈ G,V
  // 2     u.color = WHITE
  // 3     u.π = NIL
  // 4 time = 0
  // 5 for each vertex u ∈ G,V
  // 6     if u.color == WHITE
  // 7         DFS-VISIT(G,u)
  //
  // DFS-VISIT(G,u)
  // 1 time = time + 1    // white vertex u has just been discovered
  // 2 u.d = time
  // 3 u.color = GRAY
  // 4 for each v ∈ G.Adj[u]     // explore edge (u,v)
  // 5     if v.color == WHITE
  // 6         v.π = u
  // 7         DFS-VISIT(G,v)
  // 8 u.color = BLACK         // blacken u; it is finished
  // 9 time = time + 1
  // 10 u.f = time
  //
  // TOPOLOGICAL-SORT(G)
  // 1 call DFS(G) to compute finishing times v.f for each vertex v
  // 2 as each vertex is finished, insert it onto front of a linked list
  // 3 return the linked list of vertices

  const buildList: string[] = []; // list of ordered vertices--don't need linked list because
  // we just want relative ordering

  const verticesToVisit: ISortVertex = {};
  templates.forEach(function(template) {
    verticesToVisit[template.itemId] = SortVisitColor.White; // not yet visited
  });

  // Algorithm visits each vertex once. Don't need to record times or "from' nodes ("π" in pseudocode)
  templates.forEach(function(template) {
    if (verticesToVisit[template.itemId] === SortVisitColor.White) {
      // if not yet visited
      visit(template.itemId);
    }
  });

  // Visit vertex
  function visit(vertexId: string) {
    verticesToVisit[vertexId] = SortVisitColor.Gray; // visited, in progress

    // Visit dependents if not already visited
    const template = findTemplateInList(templates, vertexId);
    const dependencies: string[] = template && template.dependencies ? template.dependencies : [];
    dependencies.forEach(function(dependencyId) {
      if (verticesToVisit[dependencyId] === SortVisitColor.White) {
        // if not yet visited
        visit(dependencyId);
      } else if (verticesToVisit[dependencyId] === SortVisitColor.Gray) {
        // visited, in progress
        throw Error("Cyclical dependency graph detected");
      }
    });

    verticesToVisit[vertexId] = SortVisitColor.Black; // finished
    buildList.push(vertexId); // add to end of list of ordered vertices because we want dependents first
  }

  return buildList;
}
