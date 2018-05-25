import React, { Component } from 'react';
import LatestReleases from './LatestReleases';
import { Modal, Row, Col, message, Tag } from 'antd';

import { connect } from 'react-redux';
import { addRelease, hideModal } from '../../actions/siteActions';

class HomePage extends Component {

  // need to send transactions in Wei
  // 10^18 Wei = 1 ether
  toWei = ether => {
    return ether * 1000000000000000000
  }

  componentDidMount(){
    this.props.getReleases()
  }

  componentDidUpdate(){
    this.props.getReleases()
    console.log('home page update')
  }

  handlePurchase = () => {
    let currentRelease = this.props.releases.find(release => release.id === this.props.modalVisibility)
    console.log('curr rleease', currentRelease)
    this.props.contract.purchaseRelease(currentRelease.id, {from: this.props.user.wallet, value: this.toWei(currentRelease.price)})
    .then(res => {
      this.props.hideModal()
      setTimeout(() => this.props.getUserInfo(true), 4000)
      message.success('Successful purchase! Check your collection to download.')
    })
    .catch(error => {
      this.props.hideModal()
      this.props.getUserInfo(true)
      message.error('There was an issue with your purchase.')
      console.log(error)
    })
  }

  modalContent = () => {
    if (typeof this.props.modalVisibility === "number"){
      let currentRelease = this.props.releases.find(release => release.id === this.props.modalVisibility)
      return (
        <Row type="flex" justify="space-between">
          <Col>
            <h1> {currentRelease.title} </h1>

            <h2> {currentRelease.artist} </h2>

            <h3> Description </h3>
            <p>{currentRelease.description}</p>

            <h3> Tracklisting </h3>
            <p>{currentRelease.tracklist}</p>

            <p> <b>Price:</b> {currentRelease.price} ETH</p>
          </Col>
          <Col>
            <img alt="release art" src={currentRelease.artwork} />
          </Col>
        </Row>

      )
    } else {
      return null
    }
  }

  render() {
    return (
      <div className="Page">
        <LatestReleases releases={this.props.releases}/>
        <Modal
          visible={typeof this.props.modalVisibility === 'number'}
          closable={false}
          onOk={this.handlePurchase}
          okText="Purchase Release"
          cancelText="Back"
          onCancel={this.props.hideModal}
          width={700}
        >
          {this.modalContent()}
        </Modal>
      </div>
    );
  }

}

const mapStateToProps = state => ({
  user: state.user,
  ipfs: state.site.ipfs,
  contract: state.web3.contract,
  releases: state.site.releases,
  modalVisibility: state.site.modalVisibility
})

export default connect(mapStateToProps, { addRelease, hideModal })(HomePage);
