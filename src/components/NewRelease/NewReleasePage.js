import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUploaderFileList,
         isUploading,
         isNotUploading,
         setArtworkPreview,
         resetArtworkPreview,
         setUSDConversion } from '../../actions/siteActions';

import { Spin, message, Col } from 'antd';
import NewReleaseForm from './NewReleaseForm';

const Jimp = require('jimp')

class NewReleasePage extends Component {

  componentDidMount(){
    this.props.getUserInfo(true)
  }

  componentWillUnmount(){
    this.props.setUSDConversion(0)
  }

  calculateUSD = (e) => {
    this.props.setUSDConversion(e.target.value * this.props.USDPrice)
  }

  validatePrice = (rule, value, callback) => {
    isNaN(parseInt(value, 10)) ? callback("Must be a number!") : callback()
  }

  getBase64 = img => {
    // need to implement something for loading pic time
    const reader = new FileReader();
    reader.onloadend = () => {
      Jimp.read(Buffer.from(reader.result))
      .then(img => {
        img.resize(300, 300)
        .getBase64(Jimp.AUTO, (err, base64) => this.props.setArtworkPreview(base64));
        this.props.isNotUploading()
      })
      .catch(err => console.log("error", err))
    }
    reader.readAsArrayBuffer(img)
  }

  createRelease = (tracklistHashes, artworkHash, values, form) => {
    console.log(this.props.contract)
    // this.props.contract.createRelease.estimateGas(values.artist, values.title, values.description, values.tracklist, this.props.toTenThousandths(values.price), artworkHash, tracklistHashes, {from: this.props.user.wallet})
    // .then(res => console.log(res)).catch(res => console.log(res))
    this.props.contract.createRelease(values.artist,
                                      values.title,
                                      values.description,
                                      values.tracklist,
                                      this.props.toTenThousandths(values.price),
                                      artworkHash,
                                      tracklistHashes,
                                      {from: this.props.user.wallet})
    .then(res => {
      console.log(res)
      this.props.isNotUploading()
      form.resetFields()
      this.props.resetArtworkPreview()
      setTimeout(() => this.props.getUserInfo(true), 4000)
      message.success('Release uploaded!')
    })
    .catch(res => {
      this.props.isNotUploading()
      message.error('There was an error uploading your release. Please try again.')
      console.log("create release error", res)
    })
  }

  uploadIPFS = (values, form) => {
    // need to limit filename of release tracks.
    // 120 byte limit, 46b hash, 1b '/', 4b '.mp3'
    // 69 bytes left for the actual filename

    // uploading the image first
    this.props.ipfs.files.add({content: Buffer.from(this.props.uploader.artworkPreview)})
    .then(artwork => {
      // need to handle truncating filenames
      let fileList = this.props.uploader.files
      let fileCount = fileList.length - 1
      let files = []

      //should this be exported to a singular function to call on each iteration?
      for(let i=0; i <= fileCount; i++){

        let reader = new FileReader();

        reader.onloadend = () => {
          buffer = Buffer.from(reader.result)

          this.props.ipfs.files.add({content: buffer}).then(result => {

            // add buffered strings to our file list
            files.push(Buffer.from(result[0].hash + "/" + fileList[i].name))
            // check if we're at the end of the list, and if we are, callback
            i === fileCount ? this.createRelease(files, artwork[0].hash, values, form) : null

          }).catch(console.log)
        }

        let buffer = reader.readAsArrayBuffer(fileList[i])
      }
    })
    .catch(console.log)

  }

  handleSubmit = (e, form) => {
    e.preventDefault()
    form.validateFields((err, values) => {
      if (err){
        return message.error('Please check your data and try again.')
      }
      window.scroll(0,0)
      this.props.isUploading()
      this.uploadIPFS(values, form)
    })
  }

  setFileList = (fileInfo) => {
    this.props.setUploaderFileList(fileInfo.fileList)
  }

  setImage = (fileInfo) => {
    this.props.isUploading()
    this.getBase64(fileInfo.file)
  }

  render() {
    return (
      <Spin
        size="large"
        tip="Uploading release... Make sure you accept the Metamask prompt."
        spinning={this.props.uploader.uploading}
      >
        <Col offset={4} className="page-item"><h1>Submit New Release</h1></Col>
        <NewReleaseForm
          submit={this.handleSubmit}
          setFileList={this.setFileList}
          setImage={this.setImage}
          artworkPreview={this.props.uploader.artworkPreview}
          USDConversion={this.props.USDConversion}
          calculateUSD={this.calculateUSD}
          validatePrice={this.validatePrice}
          />
      </Spin>
    );
  }

}

const mapStateToProps = state => ({
  contract: state.web3.contract,
  user: state.user,
  uploader: state.site.uploader,
  USDPrice: state.site.USDPrice,
  USDConversion: state.site.uploader.USDConversion,
  ipfs: state.site.ipfs
})

export default connect(mapStateToProps, { setUploaderFileList, isUploading, isNotUploading, setArtworkPreview, setUSDConversion, resetArtworkPreview })(NewReleasePage);
