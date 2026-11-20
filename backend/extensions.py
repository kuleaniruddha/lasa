try:
    from flask_jwt_extended import JWTManager
except ImportError:
    class JWTManager:
        def init_app(self, app):
            pass

try:
    from flask_cors import CORS
except ImportError:
    class CORS:
        def init_app(self, app, **kwargs):
            pass

jwt = JWTManager()
cors = CORS()
