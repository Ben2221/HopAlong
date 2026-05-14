import Constants from 'expo-constants';

// The IP address of your machine on the local network (from your Expo output)
const LOCAL_IP = '192.168.1.14'; 

export const BASE_URL = __DEV__ 
  ? `http://${LOCAL_IP}:5000/api` 
  : 'https://hopalong-r0r9.onrender.com/api';

export const SOCKET_URL = __DEV__
  ? `http://${LOCAL_IP}:5000`
  : 'https://hopalong-r0r9.onrender.com';
