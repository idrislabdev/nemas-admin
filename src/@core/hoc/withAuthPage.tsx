/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
// import { Squares2X2Icon } from "@heroicons/react/24/outline";

const withAuthPage = (Pages: any) => {
  const WrappedComponent = (props: any) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
      const token = typeof window !== 'undefined'  ? localStorage.getItem("token") : undefined;

      setIsReady(true)
      if (!token)
        router.replace("/login")

      const fetchData = async () => {
        const resp = await axiosInstance.get(`/users/me/`)
        const data = resp.data
        const obj = {
          "email" : data.email,
          "name" : data.name,
          "id" : data.id
        }
        localStorage.setItem("user", JSON.stringify(obj))
        setLoading(true)  
      }

      if (isReady) {
        fetchData()
        .catch((err) => {
          console.log(err)
          localStorage.clear()
          router.replace("/login")
        });  
      }

    }, [router, isReady])

    useEffect(() => {
        setIsReady(true)
    },[isReady])


    if (!loading) {
      return <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="loading">
            {/* <Squares2X2Icon /> */}
            <div className="loading__bar w-11"></div>
        </div>
      </div>
    }

    return<Pages {...props} />

  }

  WrappedComponent.displayName = `withAuthPage(${Pages.displayName || Pages.name})`;

  return WrappedComponent;
};

export default withAuthPage;
