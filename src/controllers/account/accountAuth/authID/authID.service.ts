import { RowDataPacket } from 'mysql2';
import { pool } from '../../../../plugins/db';

interface ResponseResult {
    authID: string;
  }
  
  export async function getAuthID(appID: string, userID: string): Promise<ResponseResult> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('CALL SelectAuthID(?, ?)', [appID, userID]);

      const result = (rows as RowDataPacket[][])[0][0];
  
      return {
        authID: result?.authID ?? '',
      };
    } finally {
      conn.release();
    }
  }
  
