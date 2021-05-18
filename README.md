# 다날 신용카드 결제 CP Ready
 - 사용자 카드정보 인증 과정
# 2021-05-18
 - 내용: 카드 정보 입력 값을 POST body 에 Json data로 받아서 처리하는 API 추가 
 - API 추가 (POST)
    - 라우터 추가: router.post('/api/doready', danal_controller.DoDanalReady)
    - Controller export func 추가 

        function DoDanalReady(req, res, next){
            postCallCredit(req,res,0);
        }
        module.exports = {
            DanalReady: DanalReady,
            DoDanalReady:DoDanalReady,
        }