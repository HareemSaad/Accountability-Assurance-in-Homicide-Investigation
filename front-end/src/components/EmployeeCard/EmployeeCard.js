import React, { useState, useEffect } from "react";
import "./EmployeeCard.css";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import { client } from "../data/data";
import { rankMap } from "../data/data";

export const EmployeeCard = () => {
  const [empCardResponse, setEmpCardResponse] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const query = `
        query {
            officers(where: {branch: "${localStorage.getItem(
              "branchid"
            )}", employmentStatus: 1, rank_lt: 3}) {
              id
              name
              rank
            }
          }
        `;
    const response = await client.query(query).toPromise();
    const { data, fetching, error } = response;
    // console.log(data);
    setEmpCardResponse(data.officers);
  }

  let navigate = useNavigate();

  function print(cardId) {
    navigate(`/employee-detail/${cardId}`);
  }

  const goto = (e) => {
    const { name } = e.target;
    console.log("params ::", name);
    navigate(`/${name}`);
  };

  return (
    <>
      <div className="d-flex justify-content-between">
        <h1 className="m-4">Active Employees</h1>
        <div className="d-flex">
          <button
            className="card-add-btn"
            name="view-officer-requests"
            onClick={(e) => goto(e)}
          >
            Officer Requests
          </button>
          <button
            className="card-add-btn"
            name="view-detective-requests"
            onClick={(e) => goto(e)}
          >
            Detective Requests
          </button>
          <button
            className="card-add-btn"
            name="archive-employees"
            onClick={(e) => goto(e)}
          >
            Archive
          </button>
        </div>
      </div>

      <div className="">
        <div className="emp-card-container">
          {/* {empCardResponse.length > 0 ? empCardResponse.map((employee, index) => ( */}
          {
            empCardResponse.map((employee, index) => (
              <Card
                style={{ width: "18rem", height: "9rem" }}
                className="emp-case-card"
              >
                <Card.Body>
                  <Card.Title>{employee.name}</Card.Title>
                  {/* <Card.Subtitle className="mb-2 text-muted">{officerList[employee.category]}</Card.Subtitle> */}
                  <Card.Subtitle className="mb-2 text-muted">
                    {rankMap.get(employee.rank)}
                  </Card.Subtitle>
                  <button
                    className="emp-card-btn"
                    onClick={() => print(employee.id)}
                  >
                    View
                  </button>
                </Card.Body>
              </Card>
            ))
            // :
            // <h4 style={{ textAlign: 'center' }} className='mb-2 mt-4'><em>No Officer is this Case</em></h4>
          }
        </div>
      </div>
    </>
  );
};
