/**
 * @description Kafka 이벤트별 타입 정의
 * @author 이성범
 */

export interface AuthIDEventData {
    appID: string;
    userID: string;
    authID: string;
}