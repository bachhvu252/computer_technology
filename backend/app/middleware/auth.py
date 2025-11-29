from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            current_user = User.find_by_id(current_user_id)
            
            if not current_user:
                return jsonify({'success': False, 'message': 'User not found'}), 401
            
            kwargs['current_user'] = current_user
            return f(*args, **kwargs)
        
        except Exception as e:
            return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
    
    return decorated

def roles_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                current_user = User.find_by_id(current_user_id)
                
                if not current_user:
                    return jsonify({'success': False, 'message': 'User not found'}), 401
                
                if current_user.role not in roles:
                    return jsonify({
                        'success': False, 
                        'message': f"Role '{current_user.role}' is not authorized"
                    }), 403
                
                kwargs['current_user'] = current_user
                return f(*args, **kwargs)
            
            except Exception as e:
                return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
        
        return decorated
    return decorator