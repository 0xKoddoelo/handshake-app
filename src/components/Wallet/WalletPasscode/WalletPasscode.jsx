// Write by Phuong


import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {injectIntl} from 'react-intl';
import Modal from '@/components/core/controls/Modal';
import './WalletPasscode.scss';

import Passcode from '../Passcode';
import { hidePasscode } from '@/reducers/app/action';
import localStore from '@/services/localStore';
import md5 from 'md5';
import {APP} from '@/constants';

class WalletPasscode extends React.PureComponent {
  static propTypes = {
    app: PropTypes.object,  
    onSuccess: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      valueConfirm: 0,    
      contentPasscode: '',
      type: 0,
    };    
    this.key = "passcode";
  }

  onPasscodeCancelClick=()=>{
    this.modalConfirmPasscodeRef.close();
  }

  componentWillReceiveProps(nextProps) {
    let props = nextProps.app.passcodeData || {};
    // console.log('props', props);
    
    let type = props.type || 0;
    
    if (type == 1){
      this.newPasscode(props);
    }    
    else if (type == 2){
      this.requestWalletPasscode(props);
    }
  }  

  newPasscode(props){
    if (props.isShow){      
      let contentPasscode = <Passcode title={"Set your new PIN Code"} onFinish={(value)=>{this.confirmPasscode(props, value)}} onCancelClick={this.onPasscodeCancelClick} />;
        this.setState({valueConfirm: props.valueConfirm, isShow: props.isShow, contentPasscode: contentPasscode},()=>{        
          this.modalConfirmPasscodeRef.open();
      });      
    }
  }

  confirmPasscode(props, value){
    if (props.isShow){      
      this.setState({contentPasscode: ""}, ()=>{
          let contentPasscode = <Passcode title={"Confirm your PIN Code"} confirmValue={value} onFinish={()=> {this.savePasscode(props, value)}} onCancelClick={this.onPasscodeCancelClick}/>;
          this.setState({valueConfirm: props.valueConfirm, isShow: props.isShow, contentPasscode: contentPasscode},()=>{        
            this.modalConfirmPasscodeRef.open();
        });
      });
            
    }
  }
  
  savePasscode=(props, md5Passcode)=>{        
    localStore.save(this.key, md5Passcode);
    props.onSuccess();
    this.modalConfirmPasscodeRef.close();
  }
  getPasscode(){
    let setting = localStore.get(APP.SETTING); 
    if(setting){
      return setting["wallet"]['passcode'];
    }
    return null;
  }

  onRequestWalletPasscodeSuccess=(props)=>{
    props.onSuccess();
    this.modalConfirmPasscodeRef.close();
  }

  requestWalletPasscode(props){
    if (props.isShow){
      let onSuccess = props.onSuccess;
      let confirmValue = this.getPasscode();
      let contentPasscode = <Passcode title={"Unlock your Wallet"} confirmValue={confirmValue} onFinish={()=>{this.onRequestWalletPasscodeSuccess(props);}} onCancelClick={this.onPasscodeCancelClick}/>;
        this.setState({valueConfirm: props.valueConfirm, isShow: props.isShow, contentPasscode: contentPasscode},()=>{        
          this.modalConfirmPasscodeRef.open();
      });      
    }
  }


  hidePasscode=()=>{    
    this.setState({valueConfirm: 0, isShow: false, contentPasscode: ''}); 
    this.props.hidePasscode();
  }

  render() {
    const { isShow, valueConfirm } = this.state;  
    // const { messages } = this.props.intl;      
    return (
      
    <Modal modalHeaderStyle={{"display": "none"}} modalBodyStyle={{"padding": 0, "background": "#42399c"}} onClose={() => {this.hidePasscode();}} title={"PASSCODE"} onRef={modal => this.modalConfirmPasscodeRef = modal}>
      <div className="wallet-passscode">
      {/* <div className="wallet-passscode-title">
        Remember this Password. If you forget it, you can lost wallet
      </div> */}
      {this.state.contentPasscode}

      </div>        
    </Modal>
    );
  }
}

const mapState = state => ({
  app: state.app,
});

const mapDispatch = ({
  hidePasscode,
});


export default injectIntl(connect(mapState, mapDispatch)(WalletPasscode));
