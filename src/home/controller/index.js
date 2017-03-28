'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file index_index.html
    let res = {
      title:'index page 1'
    };
    this.assign(res);
    return this.display();
  }

  listAction(){
    //auto render template file index_index.html
    let res = {
      title:'list page 1'
    };
    this.assign(res);
    return this.display();
  }
}
