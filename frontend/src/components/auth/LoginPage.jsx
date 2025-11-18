import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';

// const LoginPage = () => {
//     const { login, register, demoMode } = useApp();
//     const [isLogin, setIsLogin] = useState(true);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [userName, setUserName] = useState('');
//     const [phone, setPhone] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);
//
//         const result = isLogin
//             ? await login(email, password)
//             : await register(userName, email, password, phone);
//
//         setLoading(false);
//         if (!result.success) {
//             setError(result.message || 'Authentication failed');
//         }
//     };
//
//     const handleDemoLogin = async (role) => {
//         setLoading(true);
//         const emails = {
//             citizen: 'citizen@demo.com',
//             official: 'official@demo.com',
//             analyst: 'analyst@demo.com'
//         };
//         await login(emails[role], 'demo');
//         setLoading(false);
//     };
//
//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
//             <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
//                 <div className="text-center mb-8">
//                     <h1 className="text-4xl font-bold text-blue-400 mb-2">🌊 CoastGuard</h1>
//                     <p className="text-gray-400 text-sm">Coastal Hazard Monitoring Platform</p>
//                     {demoMode && (
//                         <div className="mt-3 bg-yellow-500 bg-opacity-10 border border-yellow-500 text-yellow-300 px-3 py-2 rounded-lg text-xs">
//                             Demo Mode Active - No backend required
//                         </div>
//                     )}
//                 </div>
//
//                 {demoMode && (
//                     <div className="mb-6">
//                         <p className="text-gray-300 text-sm mb-3 text-center font-semibold">Quick Demo Login:</p>
//                         <div className="grid grid-cols-3 gap-2">
//                             <button
//                                 onClick={() => handleDemoLogin('citizen')}
//                                 disabled={loading}
//                                 className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition"
//                             >
//                                 Citizen
//                             </button>
//                             <button
//                                 onClick={() => handleDemoLogin('official')}
//                                 disabled={loading}
//                                 className="bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded-lg transition"
//                             >
//                                 Official
//                             </button>
//                             <button
//                                 onClick={() => handleDemoLogin('analyst')}
//                                 disabled={loading}
//                                 className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded-lg transition"
//                             >
//                                 Analyst
//                             </button>
//                         </div>
//                         <div className="relative my-6">
//                             <div className="absolute inset-0 flex items-center">
//                                 <div className="w-full border-t border-gray-600"></div>
//                             </div>
//                             <div className="relative flex justify-center text-xs">
//                                 <span className="px-2 bg-gray-800 text-gray-400">or use custom credentials</span>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//
//                 <h2 className="text-2xl text-gray-200 mb-6 text-center font-semibold">
//                     {isLogin ? 'Welcome Back' : 'Join Us'}
//                 </h2>
//
//                 {error && (
//                     <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
//                         {error}
//                     </div>
//                 )}
//
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {!isLogin && (
//                         <>
//                             <div>
//                                 <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
//                                 <input
//                                     type="text"
//                                     placeholder="johndoe"
//                                     value={userName}
//                                     onChange={(e) => setUserName(e.target.value)}
//                                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-gray-300 text-sm font-medium mb-2">Phone (optional)</label>
//                                 <input
//                                     type="tel"
//                                     placeholder="+1234567890"
//                                     value={phone}
//                                     onChange={(e) => setPhone(e.target.value)}
//                                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                                 />
//                             </div>
//                         </>
//                     )}
//
//                     <div>
//                         <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
//                         <input
//                             type="email"
//                             placeholder="john@example.com"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                             required
//                         />
//                     </div>
//
//                     <div>
//                         <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
//                         <input
//                             type="password"
//                             placeholder="••••••••"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                             required
//                         />
//                     </div>
//
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
//                     >
//                         {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
//                     </button>
//                 </form>
//
//                 <div className="mt-6 text-center">
//                     <button
//                         onClick={() => {
//                             setIsLogin(!isLogin);
//                             setError('');
//                         }}
//                         className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
//                     >
//                         {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default LoginPage;

const LoginPage = () => {
    const { login, register } = useApp();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = isLogin
            ? await login(email, password)
            : await register(userName, email, password, phone);

        setLoading(false);
        if (!result.success) {
            setError(result.message || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-400 mb-2">CoastGuard</h1>
                    <p className="text-gray-400 text-sm">Coastal Hazard Monitoring Platform</p>
                </div>

                <h2 className="text-2xl text-gray-200 mb-6 text-center font-semibold">
                    {isLogin ? 'Welcome Back' : 'Join Us'}
                </h2>

                {error && (
                    <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                                <input
                                    type="text"
                                    placeholder="johndoe"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Phone (optional)</label>
                                <input
                                    type="tel"
                                    placeholder="+1234567890"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
                    >
                        {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
