import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';

const AddInfo = ({ heading, namePlaceholder, detailPlaceholder, state, setState }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  return (
    <div className='container'>
      <h2 className='m-3'>{heading}</h2>
      <form>
        <div class="row g-3 align-items-center m-3">
          <div class="col-2">
            <label for={namePlaceholder} class="col-form-label">{namePlaceholder}</label>
          </div>
          <div class="col-9">
            <input type="text" name='name' id={namePlaceholder} class="form-control" onChange={handleChange}/>
          </div>
        </div>

        <div class="row g-3 align-items-center m-3">
          <div class="col-2">
            <label for={detailPlaceholder} class="col-form-label">{detailPlaceholder}</label>
          </div>
          <div class="col-9">
            <input type="text" name='contact' id={detailPlaceholder} class="form-control" onChange={handleChange}/>
          </div>
        </div>

        <div className='row justify-content-center'>
        <button type="submit" class="btn btn-primary m-3 col-2">Submit</button>
        </div>
      </form>
    </div>
  );

}

export default AddInfo;