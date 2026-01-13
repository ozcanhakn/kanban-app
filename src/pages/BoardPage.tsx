/**
 * BoardPage
 * Single board view with columns and cards
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Board } from '../components/Board/Board';

export function BoardPage() {
    const { boardId } = useParams<{ boardId: string }>();
    const navigate = useNavigate();

    if (!boardId) {
        navigate('/');
        return null;
    }

    return <Board boardId={boardId} onBack={() => navigate('/')} />;
}
