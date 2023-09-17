import React, { useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddInfo = ({ heading, namePlaceholder, detailPlaceholder, categoryArray }) => {

  const [selectedValue, setSelectedValue] = useState(null);
  const [formInfo, setFormInfo] = useState({name: '', detail: '', category: ''});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInfo({ ...formInfo, [name]: value });
  };
  
  // Function to handle dropdown item selection
  const handleDropdownSelect = (categoryValue) => {
    setSelectedValue(categoryValue);
    const name = 'category';
    setFormInfo({ ...formInfo, [name]: categoryValue });
  };

  const handleSubmit = () => {
    console.log("state: ", formInfo);
    console.log("selectedValue: ", selectedValue);
  };

  return (
    <div className='container'>
      <h2 className='m-3'>{heading}</h2>
      <form>
        <div className="row g-3 align-items-center m-3">
          <div className="col-2">
            <label htmlFor={namePlaceholder} className="col-form-label">{namePlaceholder}</label>
          </div>
          <div class="col-9">
            <input type="text" name='name' id={namePlaceholder} className="form-control" onChange={handleChange} />
          </div>
        </div>

        <div className="row g-3 align-items-center m-3">
          <div class="col-2">
            <label htmlFor={detailPlaceholder} className="col-form-label">{detailPlaceholder}</label>
          </div>
          <div class="col-9">
            <input type="text" name='detail' id={detailPlaceholder} className="form-control" onChange={handleChange} />
          </div>
        </div>

        <div className="row g-3 align-items-center m-3">

          <div className="col-2">
            <label htmlFor="category-type" className="col-form-label">Select Category</label>
          </div>

          <div class="col-9">
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="category-type"> {selectedValue ? selectedValue : 'Select a category'} </Dropdown.Toggle>

              <Dropdown.Menu>
                {categoryArray.map((category, index) => (
                  <Dropdown.Item name='category' key={index} onClick={() => handleDropdownSelect(category)}> {category} </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className='row justify-content-center'>
          <button type="button" className="btn btn-primary m-3 col-2" onClick={() => handleSubmit()}>Submit</button>
        </div>
      </form>
    </div>
  );

}

export default AddInfo;