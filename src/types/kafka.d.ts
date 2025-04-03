/**
 * @description Kafka 이벤트별 타입 정의
 * @author 이성범
 */

export interface AuthIDEventData {
    appID: string;
    userID: string;
    authID: string;
}

export interface EventLogData {
    timestamp: string;
    header: {
        authorization: string;
        xForwardedFor: string[] | string;
        userAgent: string;
        contentType: string;
    },
    data: Record<string, any> | Record<string, any>[];
    path: string;
    method: string;
    statusCode: number;
    responseTime: number;
}