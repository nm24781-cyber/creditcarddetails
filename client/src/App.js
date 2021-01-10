import React, {Component} from "react";
import * as axios from "axios";
import "./App.css";

const cardNumberRegex = RegExp(/^([0-9]{16})$/);
const cvCodeRegex = RegExp(/^([0-9]{3})$/);
const cardOwnerRegex = RegExp(/^[a-zA-Z ]*$/);
const dateRegex = RegExp(/^(0?[1-9]|1[012])[/]\d{4}$/);

const formValid = ({formErrors, ...rest}) => {
    let valid = true;

    // validate form errors being empty
    Object.values(formErrors).forEach(val => {
        val.length > 0 && (valid = false);
    });

    // validate the form was filled out
    Object.values(rest).forEach(val => {
        val === null && (valid = false);
    });

    return valid;
};

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            expDate: null,
            cvCode: null,
            cardNumber: null,
            cardOwner: null,
            formErrors: {
                cardNumber: "",
                expDate: "",
                cvCode: "",
                cardOwner: ""
            },
            showSuccessMessage: false,
            invalidMessage : false
        };
    }

    handleSubmit = async e => {
        e.preventDefault();
        if (formValid(this.state)) {
            console.log(`
        --SUBMITTING--
        CARD NUMBER: ${this.state.cardNumber}
        EXPIRATION DATE: ${this.state.expDate}
        CVC: ${this.state.cvCode}
        CARD OWNER NAME: ${this.state.cardOwner}
      `);
            try {
                const {status} = await axios.post('http://localhost:9000/carddetails', {
                    cardDetails: this.state
                });
                if (status === 200) {
                    this.setState({showSuccessMessage: true});

                    setTimeout(() => {
                        this.setState({
                            expDate: null,
                            cvCode: null,
                            cardNumber: null,
                            cardOwner: null,
                            formErrors: {
                                cardNumber: '',
                                expDate: '',
                                cvCode: '',
                                cardOwner: ''
                            },
                            showSuccessMessage: false,
                            invalidMessage : false
                        });

                    }, 2000)

                }
            } catch (e) {
                throw Error;
            }

        } else {
            this.setState({invalidMessage: true});

            setTimeout(() => {
                this.setState({invalidMessage: false});
            }, 2000)
        }
    };

    handleChange = e => {
        e.preventDefault();
        const {name, value} = e.target;
        let formErrors = {...this.state.formErrors};

        switch (name) {
            case "cardNumber":
                formErrors.cardNumber = cardNumberRegex.test(value)
                    ? ""
                    : "invalid credit card number";
                break;
            case "expDate":
                formErrors.expDate = ""
                if (!dateRegex.test(value)){
                    formErrors.expDate="Invalid Format"
                    break;
                }
                const today = new Date();
                const valueArr = value.split("/");
                if (today.getMonth() > parseInt(valueArr[0])) {
                    formErrors.expDate = "Expired Card"
                }
                if (today.getFullYear() > parseInt(valueArr[1])) {
                    formErrors.expDate = "Expired Card"
                }
                break;
            case "cvCode":
                formErrors.cvCode =
                    value.length === 3 && cvCodeRegex.test(value) ? "" : "invalid CVC";
                break;
            case "cardOwner":
                formErrors.cardOwner =
                    value.length > 3 && cardOwnerRegex.test(value) ? "" : "enter full name";
                break;
            default:
                break;
        }

        this.setState({formErrors, [name]: value});
    };

    render() {
        const {formErrors} = this.state;

        return (
            <div className="wrapper">
                <div className="form-wrapper">
                    <h2>Credit Card Payment Gateway</h2>
                    <h3>Payment Details</h3>
                    <form onSubmit={this.handleSubmit} noValidate>
                        <div className="cardNumber">
                            <label htmlFor="cardNumber"><b>CARD NUMBER</b></label>
                            <input
                                className={formErrors.cardNumber.length > 0 ? "error" : null}
                                placeholder="Valid Card Number"
                                type="text"
                                name="cardNumber"
                                maxLength="16"
                                noValidate
                                value={this.state.cardNumber || ''}
                                onChange={this.handleChange}
                            />
                            {formErrors.cardNumber.length > 0 && (
                                <span className="errorMessage">{formErrors.cardNumber}</span>
                            )}
                        </div>

                        <div className="expDate">
                            <label htmlFor="expDate"><b>Expiration Date</b></label>
                            <input
                                className={formErrors.expDate.length > 0 ? "error" : null}
                                placeholder="MM/YY"
                                type="text"
                                name="expDate"
                                maxLength="7"
                                value={this.state.expDate || ''}
                                noValidate
                                onChange={this.handleChange}

                            />
                            {formErrors.expDate.length > 0 && (
                                <span className="errorMessage">{formErrors.expDate}</span>
                            )}
                        </div>

                        <div className="cvCode">
                            <label htmlFor="cvCode"><b>CV CODE</b></label>
                            <input
                                className={formErrors.cvCode.length > 0 ? "error" : null}
                                placeholder="CVC"
                                type="text"
                                name="cvCode"
                                maxLength="3"
                                value={this.state.cvCode || ''}
                                noValidate
                                onChange={this.handleChange}
                            />
                            {formErrors.cvCode.length > 0 && (
                                <span className="errorMessage">{formErrors.cvCode}</span>
                            )}
                        </div>
                        <div className="cardOwner">
                            <label htmlFor="cardOwner"><b>Card Owner Name</b></label>
                            <input
                                className={formErrors.cardOwner.length > 0 ? "error" : null}
                                placeholder="Card Owner Name"
                                type="text"
                                name="cardOwner"
                                value={this.state.cardOwner || ''}
                                noValidate
                                onChange={this.handleChange}
                            />
                            {formErrors.cardOwner.length > 0 && (
                                <span className="errorMessage">{formErrors.cardOwner}</span>
                            )}
                        </div>
                        <div className="comfirmPayment">
                            <button type="submit">Confirm Payment</button>
                        </div>
                    </form>
                </div>
                <br/>
                <div>
                    {
                        this.state.showSuccessMessage &&
                        <div className="success">Details Submitted Sucessfully.</div>
                    }
                </div>
                <div>
                    {
                        this.state.invalidMessage &&
                        <div className="failure">Please Fill The Details Properly.</div>
                    }
                </div>
            </div>
        );
    }
}

export default App;
