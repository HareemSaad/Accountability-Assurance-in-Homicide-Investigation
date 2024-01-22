import React, { useState, useEffect } from "react";
import "./CaseCard.css";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import Dropdown from "react-bootstrap/Dropdown";
import { IoNavigateCircleOutline } from "react-icons/io5";
import { client } from "../data/data";

export const CaseCardCaptain = () => {
  // const [CaptainCard, setCaptainCard] = useState([]);
  const casePageArray = [ "Add Case", "Archive Cases", "Employees"];
  const requestsPage = ["Create Trustee Request", "View Trustee Request", "Trustee Access", "View Transfer Case", "View Transfer Captain", "View Transfer Officer Branch"];
//   const employeesPage = [ "Employees", "Archive Cases"];
  const [cardResponse, setCardResponse] = useState([]);
  const { address } = useAccount();
  let navigate = useNavigate();

  useEffect(() => {
    // const CaptainCards = [213, 192, 615, 888, 999];
    // setCaptainCard(CaptainCards)
    fetchData();
  }, []);

  async function fetchData() {
    const query = `
      {
        officer(id: "${address}") {
          cases (where: {status: 1}) {
            id
          }
        }
      }
    `;
    try {
      const response = await client.query(query).toPromise();
      const { data } = response;
      // console.log("data", data, address);
      setCardResponse(data.officer.cases);
    } catch (error) {
      console.log("error", error);
    }
  }

  function print(cardId) {
    navigate(`/case-detail/${cardId}`);
  }

  const goto = (e, pageName) => {
    const { name } = e.target;
    // console.log("pageName: ", pageName);
    console.log("params ::", name);

    switch (pageName) {
      case "Add Case":
        navigate("/add-case");
        break;
      case "View Trustee Request":
        navigate("/view-trustee-request");
        break;
      case "Create Trustee Request":
        navigate("/create-request/trustee-request");
        break;
      case "Trustee Access":
        navigate("/trustee-access");
        break;
      case "View Transfer Captain":
        navigate("/captain/view-transfer-captain");
        break;
      case "View Transfer Case":
        navigate("/captain/view-transfer-case");
        break;
      case "View Transfer Officer Branch":
        navigate("/captain/view-transfer-officer-branch");
        break;
      case "Employees":
        navigate("/employees");
        break;
      case "Archive Cases":
        navigate("/archive-cases");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between">
        <h1 className="m-4">Cases</h1>
        {/* <h1 className='m-4'>Cases -- {localStorage.getItem("rank")}</h1> */}
        <div className="d-flex justify-content-around col-5 mb-4 page-dropdown">
          {/* Case or Employees */}
          <div className="col-5">
            <Dropdown>
              <Dropdown.Toggle
                id="stateCode"
                className="dropdown page-dropdown-toggle customBackground"
              >
                Case or Employees <IoNavigateCircleOutline />
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {casePageArray.map((page, index) => (
                  <Dropdown.Item
                    name="stateCode"
                    className="page-dropdown-item"
                    key={index}
                    onClick={(e) => goto(e, page)}
                  >
                    {page}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          {/* Requests */}
          <div className="col-5">
            <Dropdown>
              <Dropdown.Toggle
                id="requestsPage"
                className="dropdown page-dropdown-toggle customBackground"
              >
                Requests <IoNavigateCircleOutline />
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown">
                {requestsPage.map((page, index) => (
                  <Dropdown.Item
                    name="requestsPage"
                    className="page-dropdown-item"
                    key={index}
                    onClick={(e) => goto(e, page)}
                  >
                    {page}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="card-container">
        {cardResponse.map((card, index) => (
          <Card className="case-card">
            <h2 className="mb-3 mt-3 pb-5">Case# {card.id}</h2>
            <button
              className="card-btn"
              onClick={() => print(card.id, card.status)}
            >
              View
            </button>
          </Card>
        ))}
      </div>
    </>
  );
};
