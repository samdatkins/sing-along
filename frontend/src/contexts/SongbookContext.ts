import React from "react";
import { Songbook } from "../models";

const SongbookContext = React.createContext<Songbook | undefined>(undefined);
export default SongbookContext;
