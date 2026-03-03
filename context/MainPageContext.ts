// import { createContext, useEffect, useState } from "react";

// export const MainPageContext = createContext(null);

// export const MainPageProvider = ({ children }: { children: React.ReactNode }) => {
//     const [photos, setPhotos] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
    
//     return (
//         <MainPageContext.Provider value={loading}>
//             {children}
//         </MainPageContext.Provider>
//     );
// };