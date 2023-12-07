import React, { useState, useEffect } from 'react'
import './CaseCard.css'
import CaseDetailsPage from '../CaseDetails/CaseDetails';
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
import { createClient, cacheExchange, fetchExchange } from 'urql';
import { useAccount } from 'wagmi';

const APIURL = "https://api.studio.thegraph.com/query/56707/fyp/version/latest";

const client = createClient({
    url: APIURL,
    exchanges: [cacheExchange, fetchExchange]
})

export const CaseCard_Captain = () => {

    // const [CaptainCard, setCaptainCard] = useState([]);
    const [cardResponse, setCardResponse] = useState([]);
    const { address, connector, isConnected } = useAccount()
    let navigate = useNavigate();

    useEffect(() => {
        // const CaptainCards = [213, 192, 615, 888, 999];
        // setCaptainCard(CaptainCards)
        fetchData();
    }, []);

    async function fetchData() {

        const query = `
        query {
            cases(where: { captain: "0x86d5ca9d24ece1d8c35a45b83ba15b1b9e11bd50" }) {
              id
              officers {
                id
                rank
              }
              status
            }
          }
        `
        const response = await client.query(query).toPromise();
        const { data, fetching, error } = response;
        setCardResponse(data.cases);
    }
    
    function print(cardId) {
        navigate(`/case-detail/${cardId}`);
    }

    const goto = (e) => {
        const { name } = e.target;
        console.log("params ::", name)
        navigate(`/${name}`);
    }

    return (
        <>
            <div className="d-flex justify-content-between">
                <h1 className='m-4'>Cases</h1>
                <div className="d-flex">
                    <button className='card-add-btn' name="add-case" onClick={(e) => goto(e)}>Add Case</button>
                    {/* <button className='card-add-btn' name="add-officer" onClick={(e) => goto(e)}>Add Officer</button> */}
                    <button className='card-add-btn' name="employees" onClick={(e) => goto(e)}>Employees</button>
                    <button className='card-add-btn' name="archive-cases" onClick={(e) => goto(e)}>Archive Cases</button>
                </div>
            </div>

            <div className='card-container'>
                {cardResponse.map((card, index) => (
                    <Card className='case-card'>
                        <h2 className='mb-3 mt-3 pb-5'>Case# {card.id}</h2>
                        <button className='card-btn' onClick={() => print(card.id, card.status)}>View</button>
                    </Card>
                ))}
            </div>

            {/* <div className='card-container'>
                {CaptainCard.map((card, index) => (
                    <Card className='case-card'>
                        <h2 className='mb-3 mt-3 pb-5'>Case# {card}</h2>
                        <button className='card-btn' onClick={() => print(card)}>View</button>
                    </Card>
                ))}
            </div> */}
        </>
    )
}
