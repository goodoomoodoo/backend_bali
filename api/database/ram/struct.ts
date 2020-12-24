/**
 * sturct.js stores the local store structure
 */

import {User} from '../../model/struct';

export interface Store {
  users: UserStore;
}

interface UserStore {
  [hash: string]: User;
}
