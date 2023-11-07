import React from "react";
import Link from "next/link";
import { FaAngleLeft as BackIcon } from "react-icons/fa";

const PageTitle = ({ title }) => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <Link href="/">
        <BackIcon className="text-xl hover:text-primary" />
        <span className="hidden">Back</span>
      </Link>
      <h2 className="text-2xl text-base-100">{title}</h2>
    </div>
  );
};

export default PageTitle;
