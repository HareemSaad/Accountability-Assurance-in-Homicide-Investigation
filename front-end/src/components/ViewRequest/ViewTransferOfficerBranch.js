import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../utils/error-box/notify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import { useUserAddressContext } from '../Context/userAddressContext.tsx';

export const ViewTransferOfficerBranch = () => {
    const { reqId } = useParams();
    const { userAddress, setUserAddress } = useUserAddressContext();

    let navigate = useNavigate();

    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const [requestDetail, setRequestDetail] = useState({});

    useEffect(() => {
        axios.get(`http://localhost:3000/view-transfer-officer-branch/:${reqId}`)
        .then(result => setRequestDetail(result.data[0]))
        .catch(err => console.log("error:: ", err))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonDisabled(true);
        setTimeout(() => {
            setButtonDisabled(false);
        }, 5000);
        // axiospost - update the array of signers/signatures...
        axios.post(`http://localhost:3000/view-transfer-officer-branch/:${reqId}`, {"userAddress": userAddress})
            .then(res => notify("success", "Signed successfully"))
            .catch(err => {
                // console.log("error:: ", err);
                notify("error", `An Error Occured when Signing`);
            })
    }

    // Function to handle rank dropdown item selection
  const rankName = (officerRank) => {
    const name = "rank";
    if (officerRank == 0) {
        setRequestDetail({ ...requestDetail, [name]: "" });
    } else if (officerRank == 1) {
        setRequestDetail({ ...requestDetail, [name]: "Officer" });
    } else if (officerRank == 2) {
        setRequestDetail({ ...requestDetail, [name]: "Detective" });
    } else if (officerRank == 3) {
        setRequestDetail({ ...requestDetail, [name]: "Captain" });
    }
    return requestDetail.rank;
  };

  // Function to handle employment status dropdown selection
  const employmentStatusName = (employmentStatus) => {
    const name = "employmentStatus";
    if (employmentStatus == 0) {
      setRequestDetail({ ...requestDetail, [name]: "" });
    } else if (employmentStatus == 1) {
      setRequestDetail({ ...requestDetail, [name]: "Active" });
    } else if (employmentStatus == 2) {
      setRequestDetail({ ...requestDetail, [name]: "Inactive" });
    } else if (employmentStatus == 3) {
      setRequestDetail({ ...requestDetail, [name]: "Fired" });
    } else if (employmentStatus == 4) {
      setRequestDetail({ ...requestDetail, [name]: "Retired" });
    }

    return requestDetail.employmentStatus;
  };

    return (
        <div className='container'>
            <h2 className='m-3 mt-5 mb-4'>Transfer Officer Branch Request #{reqId}</h2>
            <form>
                {/* Verified Address */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="verifiedAddress" className="col-form-label"><b><em>Verified Address:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='verifiedAddress' id="verifiedAddress" className="form-control" value={requestDetail.verifiedAddress} disabled></input>
                    </div>
                </div>

                {/* Name */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="name" className="col-form-label"><b><em>Name:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='name' id="name" placeholder='Enter Name Here' className="form-control" value={requestDetail.name} disabled></input>
                    </div>
                </div>

                {/* legal Number */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="legalNumber" className="col-form-label"><b><em>Legal Number:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='legalNumber' id="legalNumber" className="form-control" value={requestDetail.legalNumber} disabled></input>
                    </div>
                </div>

                {/* badge */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="badge" className="col-form-label"><b><em>Badge:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='badge' id="badge" className="form-control" value={requestDetail.badge} disabled></input>
                    </div>
                </div>

                {/* Branch Id */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="branchId" className="col-form-label"><b><em>Branch Id:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='branchId' id="branchId" className="form-control" value={requestDetail.branchId} disabled></input>
                    </div>
                </div>
                {/* To Branch Id */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="toBranchId" className="col-form-label"><b><em>To Branch Id:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="number" name='toBranchId' id="toBranchId" className="form-control" value={requestDetail.toBranchId} disabled></input>
                    </div>
                </div>

                {/* Officer Rank dropdown */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="rank" className="col-form-label"><b><em>Officer Rank:</em></b></label>
                    </div>

                    <div className="col-9 input">
                        <input type="text" name='rank' id="rank" className="form-control" value={rankName(requestDetail.rank)} disabled></input>
                    </div>
                </div>

                {/* Employment Status */}
                <div className="row g-3 align-items-center m-3">
                    <div className="col-2">
                        <label htmlFor="employmentStatus" className="col-form-label"><b><em>Employment Status:</em></b></label>
                    </div>
                    <div className="col-9 input">
                        <input type="text" name='employmentStatus' id="employmentStatus" className="form-control" value={employmentStatusName(requestDetail.employmentStatus)} disabled></input>
                    </div>
                </div>

                
                
                {/* Submit button */}
                <button className='btn btn-primary d-grid gap-2 col-4 mx-auto m-5 p-2' type="submit" onClick={async (e) => await handleSubmit(e)} disabled={isButtonDisabled}>
                    Sign
                </button>

            </form>
        </div>
    );

}
