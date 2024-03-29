import axios from "axios";

// url 호출 시 기본 값 셋팅
const api = axios.create({
  baseURL: "http://43.201.179.98:80/api/",
  headers: { "Content-type": "application/json" }, // data type
});

// Add a request interceptor
api.interceptors.request.use(
  function (config) {
    const accessToken = localStorage.getItem("accessToken");

    //요청시 AccessToken 계속 보내주기
    if (accessToken) {
      config.headers["Authorization"] = "Bearer " + accessToken;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  async (error) => {
    const {
      config,
      response: { status },
    } = error;
    if (true) {
      const originalRequest = config;
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      const token = {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      // token refresh 요청
      const { data } = await axios.post(
        `http://43.201.179.98:80/api/auth/reissue`, // token refresh api
        token,
        { headers: { authorization: `Bearer ${accessToken}` } }
      );
      // 새로운 토큰 저장
      // dispatch(userSlice.actions.setAccessToken(data.data.accessToken)); store에 저장
      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;
      await localStorage.setItem("accessToken", newAccessToken);
      await localStorage.setItem("refreshToken", newRefreshToken);
      originalRequest.headers.authorization = `Bearer ${newAccessToken}`;
      // 401로 요청 실패했던 요청 새로운 accessToken으로 재요청
      return axios(originalRequest);
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default api;
