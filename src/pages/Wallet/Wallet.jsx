import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// service, constant
import { load } from '@/reducers/discover/action';
// components
import { Grid, Row, Col } from 'react-bootstrap';
import Button from '@/components/core/controls/Button';
import { handShakeList } from '@/data/shake.js';
import {MasterWallet} from '@/models/MasterWallet'
import Input from '@/components/core/forms/Input/Input';

import dontIcon from '@/assets/images/icon/3-dot-icon.svg';
import iconSafe from '@/assets/images/icon/icon-safe.svg';
import iconWarning from '@/assets/images/icon/icon-warning.svg';
import iconSuccessChecked from '@/assets/images/icon/icon-checked-green.svg';
import iconLoading from '@/assets/images/icon/loading.svg.raw';
import iconQRCodeBlack from '@/assets/images/icon/qr-code-black.png';

import Header from './Header';
import HeaderMore from './HeaderMore';
import WalletItem from './WalletItem';
import WalletProtect from './WalletProtect';
import WalletHistory from './WalletHistory';
import FeedCreditCard from "@/components/handshakes/exchange/Feed/FeedCreditCard";
import ReactBottomsheet from 'react-bottomsheet';
// var ReactBottomsheet = require('react-bottomsheet');
// var Blob = require('./Blob.js');
import { setHeaderRight } from '@/reducers/app/action';
import QrReader from 'react-qr-reader';
import { showAlert } from '@/reducers/app/action';
import { showLoading, hideLoading } from '@/reducers/app/action';

// import filesaver from 'file-saver';


// style
import './Wallet.scss';
import { Bitcoin } from '@/models/Bitcoin';
import ModalDialog from '@/components/core/controls/ModalDialog';
import Modal from '@/components/core/controls/Modal';
import Dropdown from '@/components/core/controls/Dropdown';

import createForm from '@/components/core/form/createForm';
import {formValueSelector} from 'redux-form';
import { required } from '@/components/core/form/validation';
import { Field } from "redux-form";
import { initHandshake } from '@/reducers/handshake/action';
import CoinTemp from '@/pages/Wallet/CoinTemp';
var QRCode = require('qrcode.react');

window.Clipboard = (function(window, document, navigator) { var textArea, copy; function isOS() { return navigator.userAgent.match(/ipad|iphone/i); } function createTextArea(text) { textArea = document.createElement('textArea'); textArea.value = text; document.body.appendChild(textArea); } function selectText() { var range, selection; if (isOS()) { range = document.createRange(); range.selectNodeContents(textArea); selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); textArea.setSelectionRange(0, 999999); } else { textArea.select(); } } function copyToClipboard() { document.execCommand('copy'); document.body.removeChild(textArea); } copy = function(text) { createTextArea(text); selectText(); copyToClipboard(); }; return { copy: copy }; })(window, document, navigator);
var isIOs = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

const nameFormSendWallet = 'sendWallet';
const SendWalletForm = createForm({ propsReduxForm: { form: nameFormSendWallet }});
 
const nameFormCreditCard = 'creditCard';
const FormCreditCard = createForm({
  propsReduxForm: {
    form: nameFormCreditCard,
    initialValues: { currency: 'ETH' },
  },
});
const selectorFormCreditCard = formValueSelector(nameFormCreditCard);

class Wallet extends React.Component {
  constructor(props) {

    super(props);
    this.state = {
      data: {},
      isLoading: false,
      error: null,
      listMainWalletBalance: [],
      listTestWalletBalance: [],
      listRewardWalletBalance: [],
      bottomSheet: false,
      listMenu: [],
      walletSelected: null,
      inputSendValue: '',
      isRestoreLoading: false,
      inputRestoreWalletValue: '',
      erroValueBackup: false,
      // tranfer:
      listCoinTempToCreate: [],
      countCheckCoinToCreate: 1,
      walletKeyDefaultToCreate: 1,
      input12PhraseValue: '',
      //Qrcode
      qrCodeOpen: false, 
      delay: 300,
      walletsData: false,
      isNewCCOpen: false,
      stepProtected: 1,
      activeProtected: false,
      transactions: [],      
    };
    this.props.setHeaderRight(this.headerRight());
  }

  showAlert(msg, type='success', timeOut=3000, icon=''){
    this.props.showAlert({
      message: <div className="textCenter">{icon}{msg}</div>,
      timeOut: timeOut,
      type: type,
      callBack: () => {}
    });
  }
  showToast(mst){
    this.showAlert(mst, 'primary', 2000 );
  }
  showError(mst){
    this.showAlert(mst, 'danger', 3000 );
  }
  showSuccess(mst){
    this.showAlert(mst, 'success', 4000, <img className="iconSuccessChecked" src={iconSuccessChecked} />);
  }
  showLoading(status){
    this.props.showLoading({message: '',});
  }
  hideLoading(){
   this.props.hideLoading();
  }

  headerRight() {
    return (<HeaderMore onHeaderMoreClick={this.onIconRightHeaderClick} />);
  }

  splitWalletData(listWallet){

    let listMainWallet = [];
    let listTestWallet = [];
    let listRewardWallet = [];

    listWallet.forEach(wallet => {
      // is reward wallet:
      if (wallet.isReward){
        listRewardWallet.push(wallet);
      }
      // is Mainnet
      else if (wallet.network === MasterWallet.ListCoin[wallet.className].Network.Mainnet){
        listMainWallet.push(wallet);
      }
      else{
        // is Testnet
        listTestWallet.push(wallet);
      }
    });

    this.setState({isLoading: true, listMainWalletBalance: listMainWallet, listTestWalletBalance: listTestWallet, listRewardWalletBalance: listRewardWallet});
  }
  componentDidMount1(){

  }
   async componentDidMount() {

    let listWallet = await MasterWallet.getMasterWallet();
    //console.log("listWallet", listWallet);

    // console.log("default", MasterWallet.getWalletDefault("ETH"))

    if (listWallet == false){
        listWallet = await MasterWallet.createMasterWallets();
        // fill data:
        await this.splitWalletData(listWallet)
    }
    else{
      this.splitWalletData(listWallet)
      //console.log('update balance for lst wallet');
      await this.getListBalace(listWallet);
    }
     /*var btc = new Bitcoin();
     var tx = await btc.transfer("tprv8ccSMiuz5MfvmYHzdMbz3pjn5uW3G8zxM975sv4MxSGkvAutv54raKHiinLsxW5E4UjyfVhCz6adExCmkt7GjC41cYxbNxt5ZqyJBdJmqPA","mrPJ6rBHpJGnsLK3JGfJQjdm5vkjeAb63M", 0.0001);

     console.log(tx)*/
  }

  getAllWallet(){
    return this.state.listMainWalletBalance.concat(this.state.listTestWalletBalance).concat(this.state.listRewardWalletBalance);
  }

  async getListBalace(listWallet) {

    const pros = []

    listWallet.forEach(wallet => {
      pros.push(new Promise((resolve, reject) => {
        wallet.getBalance().then(balance => {
          wallet.balance = balance;
          resolve(wallet);
        })
      }));
    });

    await Promise.all(pros);

    await this.splitWalletData(listWallet);


    // var btcTestnet = new Bitcoin(Bitcoin.Network.Testnet);
    // var balance = await btcTestnet.getBalance("n1MZwXhWs1unyuG6qNbEZRZV4qjzd3ZMyz");
    // console.log("btcTestnet", balance);

    // var ethRinkeby = new Ethereum (Ethereum.Network.Rinkeby);
    // balance = await ethRinkeby.getBalance("0xe70adf9aE4d5F68E80A8E2C5EA3B916Dd49C6D87");
    // console.log("ethRinkeby", balance);
  }

  toggleBottomSheet () {
    let obj = (this.state.bottomSheet) ? { 'bottomSheet': false } : { 'bottomSheet': true }
    this.setState(obj)
  }

  copyToClipboard =(text) => {
    var textField = document.createElement('textarea')
    textField.innerText = text
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
  }

  // create list menu of wallet item when click Show more ...
  creatSheetMenuItem(wallet){
    let obj = [];
      obj.push({
        title: 'Transfer',
        handler: () => {
          this.setState({isRestoreLoading: false, walletSelected: wallet, inputAddressAmountValue: '', inputSendAmountValue: ''});
          this.toggleBottomSheet();
          this.modalSendRef.open();
        }
      })

      obj.push({
        title: 'Top up coins',
        handler: () => {
          this.setState({walletSelected: wallet});
          this.toggleBottomSheet();
          this.modalFillRef.open();
        }
      })

      if(!wallet.protected){
        obj.push({
          title: 'Secure this wallet',
          handler: () => {
            this.setState({walletSelected: wallet, stepProtected: 1, activeProtected: true});
            this.toggleBottomSheet();
            this.modalProtectRef.open();
          }
        })
      }

      obj.push({
        title: 'Transaction history',
        handler: () => {
          this.setState({walletSelected: wallet, transactions: []});
          this.toggleBottomSheet();
          this.modalHistoryRef.open();
          this.showLoading();
          let dataHistory = wallet.getTransactionHistory().then(data => {
            this.setState({walletSelected: wallet, transactions: data});
            this.hideLoading();
          });
        }
      })
      obj.push({
        title: 'Copy address',
        handler: () => {
          Clipboard.copy(wallet.address);
          this.toggleBottomSheet();
          this.showToast('Copied to clipboard');
        }
      })

      if (!wallet.isReward){
        obj.push({
          title: 'Set as default {0} wallet '.format(wallet.name) + (wallet.default ? "✓ " : ""),
          handler: () => {
            wallet.default = !wallet.default;
            this.toggleBottomSheet();
            // reset all wallet default:
            let lstWalletTemp = this.getAllWallet();
            if (wallet.default) lstWalletTemp.forEach(wal => {if (wal != wallet && wal.name == wallet.name){wal.default = false;}})
            // Update wallet master from local store:
            MasterWallet.UpdateLocalStore(lstWalletTemp);
          }
        })

          obj.push({
            title: 'Remove',
            handler: () => {
              this.setState({walletSelected: wallet});
              this.modalBetRef.open();
              this.toggleBottomSheet();
            }
          })
        }

      return obj;
    }


  // Remove wallet function:
  removeWallet = () =>{
    let lstWalletTemp = this.getAllWallet();
    var index = -1;
    var walletTmp = this.state.walletSelected;
    if (walletTmp != null){
        // Find index for this item:
        lstWalletTemp.forEach(function (wal, i) {if (wal === walletTmp){index = i}});
        // Remove item:
        if (index > -1) {
          lstWalletTemp.splice(index, 1)
          // Update wallet master from local store:
          MasterWallet.UpdateLocalStore(lstWalletTemp);
          this.splitWalletData(lstWalletTemp);
        };
    }
    this.modalBetRef.close();
  }

  // Restore wallet:
  restoreWallets = () =>{

      this.setState({isRestoreLoading: true, erroValueBackup: false});
      if (this.state.inputRestoreWalletValue != ''){
        let walletData = MasterWallet.restoreWallets(this.state.inputRestoreWalletValue);
        if (walletData !== false){
          this.getListBalace(walletData);
          this.splitWalletData(walletData);
          this.setState({isRestoreLoading: false});
          this.modalRestoreRef.close();
          this.showSuccess("Your Wallet restore success");
          return;
        }
      }
    this.showError("Invalid wallets");
    this.setState({erroValueBackup: true, isRestoreLoading: false});
  }
  updateRestoreWalletValue = (evt) => {
    this.setState({
      inputRestoreWalletValue: evt.target.value
    });
  }

  sendCoin = () =>{
    if (this.state.inputAddressAmountValue == '')
      alert("Please input to address");
    else if (this.state.inputSendAmountValue == '' || this.state.inputSendAmountValue == 0)
      alert("Please input Amount value");
    else{
      this.modalConfirmSendRef.open();
    }
  }
  submitSendCoin=()=>{
    this.setState({isRestoreLoading: true});
    this.modalConfirmSendRef.close();
      this.state.walletSelected.transfer(this.state.inputAddressAmountValue, this.state.inputSendAmountValue).then(success => {
          //console.log(success);
          this.setState({isRestoreLoading: false});
          if (success.hasOwnProperty('status')){
            if (success.status == 1){
              this.showSuccess(success.message);
              this.modalSendRef.close();
            }
            else{
              this.showError(success.message);
            }
          }
      });
  }

  updateSendAmountValue = (evt) => {
    this.setState({
      inputSendAmountValue: evt.target.value
    });
  }
  getPathPicture = (evt) => {
    alert('evt.target.value' + evt.target.value);
  }


  updateSendAddressValue = (evt) => {
    this.setState({
      inputAddressAmountValue: evt.target.value
    });
  }

  // Menu for Right header bar
  creatSheetMenuHeaderMore(){
    let obj = [];
    obj.push({
      title: "Add new / Import",
      handler: () => {
          this.setState({isRestoreLoading: false, countCheckCoinToCreate: 1, listCoinTempToCreate: MasterWallet.getListCoinTemp()});
          this.modalCreateWalletRef.open();
          this.toggleBottomSheet();
      }
    })
    obj.push({
      title: 'Backup wallets',
      handler: () => {

        this.modalBackupRef.open();
        this.setState({walletsData: this.getAllWallet()});
        this.toggleBottomSheet();

      }
    })
    obj.push({
      title: 'Restore wallets',
      handler: () => {
        this.modalRestoreRef.open();
        this.toggleBottomSheet();
        this.setState({erroValueBackup: false, isRestoreLoading: false, inputRestoreWalletValue: ''});

      }
    })
    return obj;
  }

  // on select type of wallet to create:
  onSelectCoinClick = (wallet) =>{
    let listCoinTemp =  this.state.listCoinTempToCreate;

    wallet.default = !wallet.default;
    let countCheckCoinToCreate = 0;
    listCoinTemp.forEach(wal => { if (wal.default) countCheckCoinToCreate += 1;})

    this.setState({erroValueBackup: false,listCoinTempToCreate: listCoinTemp, countCheckCoinToCreate: countCheckCoinToCreate});
  }

  createNewWallets = () =>{
    this.setState({isRestoreLoading: true, erroValueBackup: false});
    let listCoinTemp =  this.state.listCoinTempToCreate;

    let phrase = this.state.input12PhraseValue.trim();

    let masterWallet = MasterWallet.createNewsallets(listCoinTemp, phrase);
    if (masterWallet == false){
      this.setState({isRestoreLoading: false, erroValueBackup: true});
    }
    else{
      if (phrase != ''){
        // need get balance
        this.getListBalace(masterWallet);
      }
      this.splitWalletData(masterWallet);
      this.modalCreateWalletRef.close();
    }

  }
  update12PhraseValue = (evt) => {
    this.setState({
      input12PhraseValue: evt.target.value
    });
  }
  updateWalletKeyDefaultValue = (evt) => {
    this.setState({
      walletKeyDefaultToCreate: evt.target.value
    });
  }

  handleToggleNewCC = () => {
    this.setState({ isNewCCOpen: !this.state.isNewCCOpen })
  }

  onIconRightHeaderClick = () =>{
    this.setState({listMenu: this.creatSheetMenuHeaderMore()})
    this.toggleBottomSheet();
  }

  onMoreClick = (wallet) => {
    this.setState({listMenu: this.creatSheetMenuItem(wallet)})
    this.toggleBottomSheet();
  }

  onWarningClick = (wallet) => {
    if (!wallet.protected){
      this.setState({walletSelected: wallet, stepProtected: 1, activeProtected: true});
      this.modalProtectRef.open();
    }
    else{

    }
  }

  onAddressClick = (wallet) => {
    this.setState({walletSelected: wallet});
    this.modalShareAddressRef.open();
  }

  handleFocus = (e) => {
    e.currentTarget.select();
  }

  handleClick = (e) => {
    this.refs.input.focus();
  }

  get listMainWalletBalance() {
    return this.state.listMainWalletBalance.map((wallet) => {
      return <WalletItem key={wallet.address+wallet.network} wallet={wallet} onMoreClick={() => this.onMoreClick(wallet)} onWarningClick={() => this.onWarningClick(wallet)} onAddressClick={() => this.onAddressClick(wallet)}  />
    });
  }
  get listTestWalletBalance() {
    return this.state.listTestWalletBalance.map((wallet) => {
      return <WalletItem key={wallet.address+wallet.network} wallet={wallet} onMoreClick={() => this.onMoreClick(wallet)} onWarningClick={() => this.onWarningClick(wallet)} onAddressClick={() => this.onAddressClick(wallet)} />
    });
  }

  get listRewardWalletBalance(){
    return this.state.listRewardWalletBalance.map((wallet) => {
      return <WalletItem key={wallet.address+wallet.network} wallet={wallet} onMoreClick={() => this.onMoreClick(wallet)} onWarningClick={() => this.onWarningClick(wallet)} onAddressClick={() => this.onAddressClick(wallet)} />
    });
  }

  get getListCoinTempForCreate(){
    return this.state.listCoinTempToCreate.map((walletTemp) => {
      return <CoinTemp key={walletTemp.network} wallet={walletTemp} onClick={() => this.onSelectCoinClick(walletTemp)} />;
    })

  }

  afterWalletFill = () =>{
    this.modalFillRef.close();
  }

  closeProtected = () => {
    this.setState({activeProtected: false});
  }
  onCopyProtected = () => {
    Clipboard.copy(this.state.walletSelected.mnemonic);
    this.showToast("Copied to clipboard");
  }

  successWalletProtect = (wallet) =>{

    let lstWalletTemp = this.getAllWallet();
    lstWalletTemp.forEach(wal => {if (wallet.mnemonic == wal.mnemonic){wal.protected = true;}})
    // Update wallet master from local store:
    MasterWallet.UpdateLocalStore(lstWalletTemp);
    this.modalProtectRef.close();
    this.splitWalletData(lstWalletTemp);
    this.showSuccess("Your wallet has been secured!");
  }

  // For Qrcode:
  handleScan=(data) =>{
    if(data){
      this.setState({
        inputAddressAmountValue: data,
      });
      this.modalScanQrCodeRef.close()
    }
  }
  handleError(err){
    console.log("error wc",err)
  }

  oncloseQrCode=()=>{
    this.setState({qrCodeOpen: false});
  }

  openQrcode = () =>{
    this.setState({qrCodeOpen: true});
    this.modalScanQrCodeRef.open()
  }

  renderScanQRCode = () =>{
    return(
      <Modal onClose={() => this.oncloseQrCode()} title="Scan QR code" onRef={modal => this.modalScanQrCodeRef = modal}>
        {this.state.qrCodeOpen ?
        <QrReader
          delay={this.state.delay}
          onScan={(data) => {this.handleScan(data)}}
          onError={this.handleError}
          style={{ width: '100%', height: '100%' }}
          />
        : ""}
      </Modal>
    )

  }

  render() {
    const {intl, userProfile, cryptoPrice, amount, userCcLimit, ccLimits} = this.props;
    return (

      <Grid>

        {/* Tooltim menu Bottom */ }
        <ReactBottomsheet
          visible={this.state.bottomSheet}
          onClose={this.toggleBottomSheet.bind(this)}
          list={this.state.listMenu} />

        {/* ModalDialog for confirm remove wallet */}
        <ModalDialog title="Confirmation" onRef={modal => this.modalBetRef = modal}>
          <div className="bodyConfirm"><span>Are you sure to want to remove this wallet?</span></div>
          <div className='bodyConfirm'>
          <Button className="left" cssType="danger" onClick={this.removeWallet} >Yes</Button>
            <Button className="right" cssType="secondary" onClick={() => { this.modalBetRef.close(); }}>Cancel</Button>
          </div>
        </ModalDialog>

        {/* ModalDialog for transfer coin */}
        <Modal title="Transfer" onRef={modal => this.modalSendRef = modal}>
          <SendWalletForm className="sendwallet-wrapper" onSubmit={this.sendCoin}>
          <div className="div-address-qr-code">
            <Input name="to_address" placeholder="Receiving address" required className="input-address-qr-code"
              type="text" value={this.state.inputAddressAmountValue}
              onChange={evt => this.updateSendAddressValue(evt)}
            />
            {!isIOs ? <img onClick={() => { this.openQrcode() }} className="icon-qr-code-black" src={iconQRCodeBlack} /> : ""}
          </div>
            <Input name="amount" type="tel" required
              value={this.state.inputSendAmountValue}
              placeholder={ this.state.walletSelected ? "Amount ({0})".format(this.state.walletSelected.name) : "Amount "}
              onChange={evt => this.updateSendAmountValue(evt)}
              />
            <Button isLoading={this.state.isRestoreLoading}  type="submit" block={true}>Transfer</Button>
          </SendWalletForm>
        </Modal>

        {/*Dialog confirm transfer coin*/}
        <ModalDialog title="Confirmation" onRef={modal => this.modalConfirmSendRef = modal}>
          <div className="bodyConfirm"><span>Are you sure you want to transfer out {this.state.inputSendAmountValue} {this.state.walletSelected ? this.state.walletSelected.name : ""}?</span></div>
          <div className='bodyConfirm'>
          <Button className="left" cssType="danger" onClick={this.submitSendCoin} >Confirm</Button>
            <Button className="right" cssType="secondary" onClick={() => { this.modalConfirmSendRef.close(); }}>Cancel</Button>
          </div>
        </ModalDialog>

        <Modal title="Top up coins" onRef={modal => this.modalFillRef = modal}>
          <FeedCreditCard buttonTitle="Top up coins" currencyForced={this.state.walletSelected ? this.state.walletSelected.name : ""}
            callbackSuccess={this.afterWalletFill}
            addressForced={this.state.walletSelected ? this.state.walletSelected.address : ""}
          />
        </Modal>

        <Modal title="Secure your wallet" onClose={this.closeProtected}  onRef={modal => this.modalProtectRef = modal}>
          <WalletProtect onCopy={this.onCopyProtected} step={this.state.stepProtected} active={this.state.activeProtected} wallet={this.state.walletSelected} callbackSuccess={() => {this.successWalletProtect(this.state.walletSelected)}} />
        </Modal>


        <Modal title="Transaction history" onRef={modal => this.modalHistoryRef = modal}>
          <WalletHistory wallet={this.state.walletSelected} transactions={this.state.transactions} />
        </Modal>


        {/* Modal for Backup wallets : */}
        <Modal title="Backup wallets" onRef={modal => this.modalBackupRef = modal}>
          <div className="bodyTitle">This data is the only way to restore your wallets. Keep it secret, keep it safe.</div>
          <div className='bodyBackup'>
          <textarea readOnly onClick={ this.handleChange } onFocus={ this.handleFocus }
           value={ this.state.walletsData ? JSON.stringify(this.state.walletsData) : ''}/>
          <Button className="button" cssType="danger" onClick={() => {Clipboard.copy(JSON.stringify(this.state.walletsData)); this.modalBackupRef.close(); this.showToast('Recovery data copied to clipboard.'); }} >Copy it somewhere safe</Button>
          </div>
        </Modal>

        {/* Modal for Restore wallets : */}
        <Modal title="Restore wallets" onRef={modal => this.modalRestoreRef = modal}>
          <div className="bodyTitle">Please enter your top secret recovery data to restore your wallet.</div>
          <div className='bodyBackup'>
          <textarea required
            value={this.state.inputRestoreWalletValue}
            className={this.state.erroValueBackup ? 'error' : ''}
            onChange={evt => this.updateRestoreWalletValue(evt)}
          />
          <Button isLoading={this.state.isRestoreLoading} className="button" cssType="danger" onClick={() => {this.restoreWallets()}} >
            Restore now
          </Button>
          </div>
        </Modal>


        {/* Modal for Copy address : */}
        <ModalDialog title="Wallet address" onRef={modal => this.modalShareAddressRef = modal}>
          <div className="bodyTitle"><span>Share your public wallet address to receive { this.state.walletSelected ? this.state.walletSelected.name : ""} </span></div>
          <div className={['bodyBackup bodySahreAddress']}>

          <QRCode value={ this.state.walletSelected ? this.state.walletSelected.address : ""} />
          <div className="addressDivPopup">{ this.state.walletSelected ? this.state.walletSelected.address : ""}</div>
          <Button className="button" cssType="success" onClick={() => {Clipboard.copy(this.state.walletSelected.address);this.modalShareAddressRef.close(); this.showToast('Wallet address copied to clipboard.');}} >
            Copy to share
          </Button>
          </div>
        </ModalDialog>

        {/* Modal for Create/Import wallet : */}
        <Modal title="Create new wallet" onRef={modal => this.modalCreateWalletRef = modal}>
        <Row className="list">
          <Header title="Select coins" hasLink={false} />
        </Row>
          <Row className="list">
            {this.getListCoinTempForCreate}
          </Row>
          <Row className="list">
          <Header title="Wallet key" />
          </Row>
          <div className="wallet-create-footer">
          <Dropdown className="dropdown-wallet"
            placeholder="Wallet key"
            defaultId={this.state.walletKeySelected}
            source={[{"id": 1, "value": "Random"}, {"id": 2, "value": "Specify recovery Phrase"}]}
            onItemSelected={(item) =>
                {
                  this.setState({
                    walletKeyDefaultToCreate: item.id
                  });
                }
              }
          />

          { this.state.walletKeyDefaultToCreate == 2 ?
            <Input name="phrase" placeholder="Type your 12 secret recovery words." required
            className={this.state.erroValueBackup ? 'input12Phrase error' : 'input12Phrase'}
                onChange={evt => this.update12PhraseValue(evt)}/>
            : ""
          }
          </div>


          <Button block isLoading={this.state.isRestoreLoading} disabled={this.state.countCheckCoinToCreate == 0 || (this.state.walletKeyDefaultToCreate == 2 && this.state.input12PhraseValue.trim().split(/\s+/g).length != 12) } className="button button-wallet" cssType="primary" onClick={() => {this.createNewWallets()}} >
            Create wallet
          </Button>
          <Header />
          {/*<div className="linkImportWallet">I want to import coins</div>*/}

        </Modal>

        {/*QR code dialog*/}
        {this.renderScanQRCode()}

        {/* Render list wallet: */}
        <Row className="list">
          <Header title="Mainnet wallets" hasLink={false} linkTitle="+ Add new" onLinkClick={this.onLinkClick} />
        </Row>
        <Row className="list">
          {this.listMainWalletBalance}
        </Row>

        <Row className="list">
          <Header title="Reward wallets" hasLink={false} />
        </Row>
        <Row className="list">
          {this.listRewardWalletBalance}
        </Row>

        <Row className="list">
          <Header title="Testnet wallets" hasLink={false} />
        </Row>
        <Row className="list">
          {this.listTestWalletBalance}
        </Row>

      </Grid>
    );
  }

}

const mapState = (state) => ({
  discover: state.discover,
  userProfile: state.exchange.userProfile,
  cryptoPrice: state.exchange.cryptoPrice,
  userCcLimit: state.exchange.userCcLimit,
  ccLimits: state.exchange.ccLimits
});

const mapDispatch = ({
  setHeaderRight,
  showAlert,
  showLoading,
  hideLoading
});


export default connect(mapState, mapDispatch)(Wallet);
