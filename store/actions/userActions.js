import { USERSTATUS_CHANGED, USEREMAILCODE_CHANGED, USER_LOADING, USER_ERROR } from "../actionKeys";
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
// https://ecty-backend.herokuapp.com/

export function stepOneEmail(UserEmail){
  return (dispatch, previousState) => {
    // console.log(UserEmail, 'CHECKING STEP ONE')
    dispatch(userLoading(true))
    axios({
      url: 'https://ecty-backend.herokuapp.com/verification/email',
      method: 'POST',
      data: { UserEmail }
    })
    .then(({data}) => {
      data = data.data
      // console.log(data, 'RESULT STEP ONE')
      dispatch(changeUserStatus(data.statusValidEmail))
      dispatch(changeUserCode(data.UniqueNumberVerificationEmail))
    })
    .catch(err => {
      console.log(err, 'ERROR STEP ONE')
      dispatch(userError(err))
    })
    .finally(() => {
      dispatch(userLoading(false))
    })
  }
}

export function stepTwoVerifyEmail(UserEmail, UniqueNumberVerificationEmail){
  return (dispatch, previousState) => {
    // console.log('CHECKING STEP TWO')
    dispatch(userLoading(true))
    axios({
      url: 'https://ecty-backend.herokuapp.com/verification/email-verification',
      method: 'PATCH',
      data: {UserEmail, UniqueNumberVerificationEmail}
    })
    .then(({data}) => {
      // console.log(data.message)
      if(data.message){
        dispatch(changeUserStatus('3'))
      }
      // console.log(data, 'RESULT STEP TWO')
    })
    .catch(err => {
      console.log(err, 'ERROR STEP TWO')
      dispatch(userError(err))
    })
    .finally(() => {
      dispatch(userLoading(false))
    })
  }
}

export function stepThreeRegisterAccount(username, email, password){
  return (dispatch, previousState) => {
    console.log('REGISTERING')
    dispatch(userLoading(true))
    axios({
      url: 'https://ecty-backend.herokuapp.com/register',
      method: 'POST',
      data: {username, email, password}
    })
    .then(({data}) => {
      dispatch(changeUserStatus('done'))
    })
    .catch(err => {
      dispatch(userError(err))
    })
    .finally(() => {
      dispatch(userLoading(false))
    })
  }
}

export function checkUserVerification(email){
  return (dispatch, previousState) => {
    // console.log(email, 'CHECKING')
    dispatch(userLoading(true))
    axios({
      url: `https://ecty-backend.herokuapp.com/verification/${email}`,
      method: 'GET',
    })
    .then(({data}) => {
      data = data.items
      // console.log(data.items, 'CHECKING RESULT')
      dispatch(changeUserStatus(data.statusValidEmail))
      dispatch(changeUserCode(data.UniqueNumberVerificationEmail))
    })
    .catch(err => {
      console.log(err, 'CHECKING ERROR')
      dispatch(userError(err))
    })
    .finally(() => {
      dispatch(userLoading(false))
    })
  }
}

export function loginUser(email, password){
  return (dispatch, previousState) => {
    dispatch(userLoading(true))
    axios({
      url: `https://ecty-backend.herokuapp.com/login`,
      method: 'POST',
      data: {email: email, password: password}
    })
    .then(({data}) => {
      return storeAcessToken(data.access_token)
    })
    .then(() => {
      return getAccessToken()
    })
    .then((response) => {
    })
    .catch(err => {
      dispatch(userError(err))
    })
    .finally(() => {
      dispatch(userLoading(false))
    })
  }
}

const storeAcessToken = async (access_token) => {
  try {
    await AsyncStorage.setItem('access_token', access_token)
  } catch (e) {
    console.log(e, 'FAIL STORING DATA')
    return e
  }
}

export const getAccessToken = async () => {
  try {
    const values = await AsyncStorage.getItem('access_token')
    return values
  } catch(e) {
    return e
  }
}

export function changeUserStatus(status){
  return { type: USERSTATUS_CHANGED, status: status}
}

export function changeUserCode(code){
  return { type: USEREMAILCODE_CHANGED, code: code}
}

export function userError (err){
  return { type: USER_ERROR, error: err}
}

export function userLoading (status){
  return { type: USER_LOADING, loading: status}
}