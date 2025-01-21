from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import re

app = FastAPI()

sql_injection_patterns = [
    # Tautologies
    r"' OR 1=1 --",
    r"' OR '1'='1",
    r'" OR "1"="1',
    r"' OR 1=1#",
    r'" OR 1=1#',
    r"'\) OR \('1'='1",
    r'"\) OR \("1"="1',

    # Comment Injection
    r"--",
    r"#",
    r"/\*.*?\*/",

    # Union-Based Injection
    r"' UNION SELECT",
    r"' UNION ALL SELECT",
    r"' UNION SELECT NULL",
    r"' UNION SELECT NULL, NULL",
    r"' UNION SELECT username, password FROM users --",
    r"' UNION ALL SELECT 1, 'data' --",
    r"'\) UNION SELECT 1, 'data' --",
    r"'\) UNION SELECT NULL, NULL --",

    # Piggy-Backed Queries
    r"'; DROP TABLE users; --",
    r"'; EXEC xp_cmdshell('dir'); --",
    r"'; SHUTDOWN; --",
    r"'; INSERT INTO users (username, password) VALUES ('admin', 'admin'); --",

    # Blind Injection
    r"' AND 1=1 --",
    r"' AND 1=0 --",
    r"' OR 1=1 --",
    r"' AND ASCII(SUBSTRING((SELECT database()), 1, 1)) > 64 --",
    r"' OR ASCII(SUBSTRING((SELECT version()), 1, 1)) = 77 --",
    r"' OR EXISTS(SELECT 1 FROM users WHERE username='admin') --",

    # Time-Based Injection
    r"' OR IF(1=1, SLEEP(5), 0) --",
    r"' AND BENCHMARK(1000000, MD5(1)) --",
    r"' WAITFOR DELAY '00:00:05' --",
    r"' AND SLEEP(5) --",

    # Error-Based Injection
    r"' AND 1=CONVERT(INT, 'x') --",
    r"' OR 1=CAST((SELECT table_name FROM information_schema.tables) AS INT) --",
    r"' AND UPDATEXML(1, CONCAT(0x3a, (SELECT database())), 1) --",
    r"' AND EXTRACTVALUE(1, CONCAT(0x3a, (SELECT version()))) --",

    # Boolean Exploits
    r"' AND '1'='1",
    r"' OR NOT '1'='2'",
    r"' AND 1=(SELECT 1)",
    r"' OR EXISTS(SELECT 1 FROM users WHERE username='admin')",

    # String Concatenation
    # r"'||'a'='a'",
    r"'+'+'a'='a'",
    r"' OR 'abc'='abc' --",
    # r"'|| (SELECT @@version) --",
    r"' OR CONCAT('a', 'b')='ab' --",

    # Encoding and Obfuscation
    r"%27 OR %271%3D%271 --",  # URL Encoding
    r"%27%3B DROP TABLE users --",
    r"0x272727 OR 0x272727",   # Hex Encoding
    r"0x646F63746F72 UNION ALL SELECT",
    r"'/*! UNION */ SELECT 1, 2 --",  # MySQL Comments

    # Subqueries and Nested Queries
    r"'; SELECT * FROM (SELECT * FROM users) --",
    r"' OR EXISTS(SELECT 1 FROM (SELECT * FROM users) as subquery) --",

    # Bypass Techniques
    r"' OR 1=1 LIMIT 1 --",
    r"' AND 1=1 ORDER BY 1 --",
    r"' AND 1=1#",
    r"' OR 1 GROUP BY 1 --",

    # Multi-line SQL
    r"'; DROP TABLE users; /* multi-line comment */",
    r"' /* anything */ UNION /* anything */ SELECT --",

    # SQL Keywords
    r"SELECT",
    r"INSERT",
    r"UPDATE",
    r"DELETE",
    r"DROP",
    r"EXEC",
    r"UNION",
    r"CAST",
    r"CONVERT",
    r"INFORMATION_SCHEMA",
    r"BENCHMARK",
    r"WAITFOR DELAY",
    r"EXTRACTVALUE",
    r"UPDATEXML",
    r"SLEEP",
    r"VERSION()",
    r"DATABASE()",
]

def detect_sql_injection(data: dict) -> bool:
    for key, value in data.items():
        if isinstance(value, str):
            for pattern in sql_injection_patterns:
                if re.search(pattern, value, re.IGNORECASE):
                    return True
    return False

@app.post("/detect/")
async def detect_sql(request: Request):
    try:
        data = await request.json()
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": f"Invalid JSON: {str(e)}",
                "code": 400
            }
        )
    
    print(f"Received payload: {data}")
    if detect_sql_injection(data):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": "SQL Injection Detected",
                "code": 400
            }
        )
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Safe",
            "code": 200
        }
    )
