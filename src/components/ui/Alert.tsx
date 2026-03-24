interface AlertProps {
    type: 'error' | 'success' | 'info';
    message: string;
}

export const Alert = ({ type, message }: AlertProps) => {
    const styles = {
        error: 'bg-red-950/50 border-fitbox-red text-red-200',
        success: 'bg-emerald-950/50 border-emerald-500 text-emerald-200',
        info: 'bg-blue-950/50 border-blue-500 text-blue-200',
    };

    return (
        <div className={`p-4 border rounded-lg mb-4 text-sm font-medium ${styles[type]}`}>
            {message}
        </div>
    );
};