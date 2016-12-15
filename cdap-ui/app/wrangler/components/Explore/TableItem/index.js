/*
 * Copyright © 2016 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import NamespaceStore from 'services/NamespaceStore';
import myExploreApi from 'api/explore';
import {Modal, ModalHeader, ModalBody} from 'reactstrap';
import shortid from 'shortid';
import Papa from 'papaparse';

require('./TableItem.less');

export default class TableItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isModalOpen: false,
      columns: [],
      preview: [],
      fieldSelected: '',
      queryHandle: ''
    };

    this.onTableClick = this.onTableClick.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onWrangleClick = this.onWrangleClick.bind(this);
    this.handleData = this.handleData.bind(this);
    this.handleSetHeaders = this.handleSetHeaders.bind(this);
    this.handleSetSkipEmptyLines = this.handleSetSkipEmptyLines.bind(this);
    this.setDelimiter = this.setDelimiter.bind(this);
  }

  setDelimiter(e) {
    this.setState({delimiter: e.target.value});
  }
  handleSetHeaders() {
    this.setState({header: !this.state.header});
  }
  handleSetSkipEmptyLines() {
    this.setState({skipEmptyLines: !this.state.skipEmptyLines});
  }

  pollQueryStatus(queryHandle) {
    this.queryStatusPoll$ = myExploreApi.pollQueryStatus({queryHandle})
      .subscribe((res) => {
        if (res.status === 'FINISHED') {
          this.fetchQueryResults(queryHandle);
        }
      });
  }

  fetchQueryResults(queryHandle) {
    this.queryStatusPoll$.dispose();
    this.queryStatusPoll$.dispose(); // check?

    myExploreApi.getQuerySchema({queryHandle})
      .combineLatest(myExploreApi.getQueryPreview({queryHandle}))
      .subscribe((res) => {
        let columns = res[0].map((header) => {
          let name;
          if (header.name.indexOf('.') !== -1) {
            name = header.name.split('.')[1];
          }

          return {
            raw: header.name,
            displayName: name
          };
        });
        let preview = res[1].map((row) => row.columns);

        this.setState({
          columns,
          preview,
          queryHandle
        });

      });
  }

  onTableClick() {
    this.setState({
      isModalOpen: true,
    });

    const table = this.props.table;

    const query = `SELECT * FROM ${table.type}_${table.name} LIMIT 500`;
    const namespace = NamespaceStore.getState().selectedNamespace;

    myExploreApi
      .submitQuery({namespace}, {query})
      .subscribe((res) => {
        let queryHandle = res.handle;
        this.pollQueryStatus(queryHandle);
      });
  }

  toggleModal() {
    this.setState({isModalOpen: !this.state.isModalOpen});
  }

  onWrangleClick() {
    myExploreApi.download({queryHandle: this.state.queryHandle})
      .subscribe((res) => {
        let papaConfig = {
          header: true,
          skipEmptyLines: true,
          complete: this.handleData
        };

        Papa.parse(res, papaConfig);
      });
  }

  handleData(papa) {
    let formattedData = papa.data.map((row) => row[this.state.fieldSelected]).join('\n');
    this.setState({isModalOpen: false});

    this.props.wrangle(
      formattedData,
      this.state.delimiter,
      this.state.header,
      this.state.skipEmptyLines
    );
  }

  render() {
    return (
      <div
        className="explore-table-item text-center"
        onClick={this.onTableClick}
      >
        <div className="explore-table-item-icon">
          <span className={classnames('fa', {
            'icon-streams': this.props.table.type === 'stream',
            'icon-datasets': this.props.table.type === 'dataset'
          })} />
        </div>
        <div className="explore-table-item-name">
          <span>{this.props.table.name}</span>
        </div>

        <Modal
          className="explore-table-modal"
          toggle={this.toggleModal}
          isOpen={this.state.isModalOpen}
          size="lg"
          zIndex="1070"
        >
          <ModalHeader>
            {this.props.table.name}
          </ModalHeader>
          <ModalBody>
            <div className="table-container">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    {this.state.columns.map((column) => <th key={column.raw}>{column.displayName}</th>)}
                  </tr>
                </thead>

                <tbody>
                  {
                    this.state.preview.map((row) => {
                      return (
                        <tr key={shortid.generate()}>
                          {row.map((columnData) => <td key={shortid.generate()}>{columnData}</td>)}
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>

            <div className="form-inline field-selection">
              <label className="control-label">
                Choose field to wrangle:
              </label>

              <select
                className="form-control"
                value={this.state.fieldSelected}
                onChange={e => this.setState({fieldSelected: e.target.value})}
              >
                {
                  this.state.columns.map((column) => {
                    return (
                      <option
                        value={column.raw}
                        key={column.raw}
                      >
                        {column.displayName}
                      </option>
                    );
                  })
                }
              </select>
            </div>

            <div className="parse-options">
              <form className="form-inline">
                <div className="delimiter">
                  {/* delimiter */}
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Set delimiter"
                    onChange={this.setDelimiter}
                  />
                </div>

                <hr/>

                <div className="checkbox">
                  {/* header */}
                  <label>
                    <input type="checkbox"
                      onChange={this.handleSetHeaders}
                      checked={this.state.headers}
                    /> First line as column name
                  </label>
                </div>

                <div className="checkbox">
                  {/* skipEmptyLines */}
                  <label>
                    <input type="checkbox"
                      onChange={this.handleSetSkipEmptyLines}
                    /> Skip empty lines
                  </label>
                </div>
              </form>
            </div>

            <div className="wrangle-button text-center">
              <button
                className="btn btn-primary"
                onClick={this.onWrangleClick}
              >
                Wrangle
              </button>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

TableItem.propTypes = {
  table: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.oneOf(['dataset', 'stream'])
  }),
  wrangle: PropTypes.func
};