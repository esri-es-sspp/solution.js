/** @license
 * Copyright 2021 Esri
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
 * Manages the creation and deployment of velocity item types.
 *
 * @module solution-velocity
 */

import {
  UserSession,
  IItemProgressCallback,
  IItemTemplate,
  ICreateItemFromTemplateResponse,
  createPlaceholderTemplate,
  fail,
  getVelocityUrl
} from "@esri/solution-common";

import { getVelocityDependencies } from "./helpers/get-velocity-dependencies";

/**
 * Convert a Velocity item into a Template
 *
 * @param solutionItemId
 * @param itemInfo
 * @param authentication
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  console.log(solutionItemId);
  const template = createPlaceholderTemplate(itemInfo.id, itemInfo.type);
  return getVelocityUrl(authentication, itemInfo.type, itemInfo.id).then(
    (url: string) => {
      return fetch(url)
        .then(data => data.json())
        .then(data_json => {
          template.data = data_json;
          template.dependencies = getVelocityDependencies(template);
          return Promise.resolve(template);
        });
    },
    e => fail(e)
  );
}

/**
 * Create a Web Experience from a Template
 *
 * @param template
 * @param templateDictionary
 * @param destinationAuthentication
 * @param itemProgressCallback
 */
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  return new Promise<ICreateItemFromTemplateResponse>(resolve => {
    console.log(template);
    console.log(templateDictionary);
    console.log(destinationAuthentication);
    console.log(itemProgressCallback);
    resolve({
      item: undefined,
      id: "",
      type: "",
      postProcess: false
    });
  });
}
