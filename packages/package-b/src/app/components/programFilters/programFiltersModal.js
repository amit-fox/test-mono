import React, { useState } from 'react'
import {
  Modal,
  Button,
} from "react-bootstrap"
import { errorDetectionDefinitions } from './programFilterConstants' 

export default function ProgramFiltersDefinitions() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div id="program-filters-modal">
      <Button
        id="programFiltersModalButton"
        variant="primary"
        onClick={handleShow}
      >
        <img src="/questionMark.png" alt="Learn more about program filters" />
      </Button>

      <Modal className='program-filters-error-modal' show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Error Type Definitions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Error Type</th>
                <th>Definition</th>
              </tr>
            </thead>
            <tbody>
              {errorDetectionDefinitions.map((row, idx) => {
                return (
                  <tr id={'EDD-' + idx}>
                    <td>{row.type}</td>
                    <td ><div dangerouslySetInnerHTML={{__html: row.longName}}></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
