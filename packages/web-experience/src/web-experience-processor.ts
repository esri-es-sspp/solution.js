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
 * Manages the creation and deployment of web-experience item types.
 *
 * @module solution-web-experience
 */

import {
  UserSession,
  IItemProgressCallback,
  IItemTemplate,
  ICreateItemFromTemplateResponse,
  fail
} from "@esri/solution-common";

export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession,
  isGroup?: boolean
): Promise<IItemTemplate> {
  return Promise.reject(
    fail(
      "convertItemToTemplate not yet implemented in solution-web-experience package"
    )
  );
}

export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  return Promise.reject(
    fail(
      "createItemFromTemplate not yet implemented in solution-web-experience package"
    )
  );
}
