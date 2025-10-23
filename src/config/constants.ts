import { Dimensions } from 'react-native';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

export const DIMENSIONES = {
  WIDTH,
  HEIGHT,
  SCALE: WIDTH / 375,
};


export const AUTH_ROUTES = {
  LOGIN: 'login',
  REGISTER: 'register',
  ADMINDASHBOARD: 'admindashboard',
  ADMINPANEL: 'adminpanel'
};


