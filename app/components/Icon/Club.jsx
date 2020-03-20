import React from "react";

const SVG = ({
  style = {},
  fill = "#000000",
  width = "100%",
  className = "",
  viewBox = "0 0 128 128"
}) => (
  <svg
    width={width}
    style={style}
    height={width}
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
    className={`svg-icon ${className || ""}`}
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <g id="club" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <path
        d="M98.1266389,49.208145 C88.2678171,48.6441838 78.9439586,53.4058563 73.5908268,61.5267976 C73.9128047,60.3128811 74.2737798,59.1094639 74.6727524,57.9175459 C74.9472335,57.0976023 75.5686907,56.4076498 76.423132,55.9741796 C86.1694615,51.0275199 92.0625561,40.7822247 91.4370991,29.8729751 C90.6381541,15.9404336 79.0839489,4.58621464 65.1329086,4.02325336 C57.5704289,3.71777438 50.4089215,6.43058776 44.9637961,11.660228 C39.5161708,16.8923681 36.5163772,23.9323838 36.5163772,31.4838643 C36.5163772,41.8911484 42.2999793,51.2815024 51.6103389,55.9906785 C52.4417817,56.4116495 53.0487399,57.087103 53.3187213,57.8935476 C53.7206937,59.092965 54.0841687,60.3048817 54.4081464,61.5262977 C49.0550147,53.4063562 39.7276563,48.6426839 29.8728342,49.208145 C15.9397927,50.0070901 4.58557376,61.5617952 4.02311246,75.5128355 C3.7186334,83.0738154 6.43094682,90.2368226 11.6605871,95.6814481 C16.8927271,101.129073 23.9327428,104.128867 31.4837234,104.128867 C40.8285806,104.128867 49.3669932,99.4556884 54.4186457,91.7532183 C51.9043186,101.234566 47.0341537,110.058459 40.2476205,117.255964 C39.1526958,118.417384 38.8527165,120.118767 39.4856729,121.584666 C40.1186294,123.050565 41.5615301,124 43.1579203,124 L49.5479807,124 L78.4509925,124 L84.8410529,124 C86.4374431,124 87.8808438,123.050565 88.5133003,121.584666 C89.1457568,120.118767 88.8462774,118.417884 87.7513527,117.255964 C80.9648195,110.058459 76.0951545,101.234066 73.5803275,91.7532183 C78.63198,99.4556884 87.1708926,104.128867 96.5157498,104.128867 C104.06673,104.128867 111.106746,101.129073 116.338886,95.6814481 C121.568526,90.2363226 124.28084,83.0738154 123.975861,75.5128355 C123.413899,61.5617952 112.059181,50.0070901 98.1266389,49.208145 Z M44.5153269,31.4843643 C44.5153269,26.1307326 46.6421806,21.1395759 50.5044149,17.4303311 C54.1681629,13.9110732 58.9313352,12.0002046 63.9944869,12.0002046 C64.2654683,12.0002046 64.5374496,12.0057042 64.8099308,12.0167035 C74.6962508,12.415676 82.8841875,20.4606226 83.4501486,30.3314436 C83.8936181,38.0679114 79.7144056,45.3329116 72.802381,48.8411703 C70.0625695,50.2315746 68.0327091,52.5529149 67.0862743,55.3782206 C65.5518798,59.9624052 64.5144512,64.7095787 63.9989866,69.501749 C63.4825222,64.7010793 62.4420937,59.9454064 60.9026996,55.3517224 C59.9592645,52.537916 57.9414033,50.2295748 55.2200905,48.8531695 C48.6175447,45.5128992 44.5153269,38.8573571 44.5153269,31.4843643 Z M76.3611362,116.00055 L51.637337,116.00055 C58.4533681,106.5532 62.7625717,95.406467 63.9989866,83.8122646 C65.2359015,95.406467 69.5451051,106.5527 76.3611362,116.00055 Z M110.569783,90.1398293 C106.860038,94.0020636 101.868882,96.1289173 96.5157498,96.1289173 C89.1722549,96.1289173 82.528712,92.0511978 79.1789424,85.4866494 C77.7625398,82.7103404 75.4177011,80.6639811 72.5768965,79.7250457 C71.4034773,79.3375724 70.1800614,78.9690977 68.9406467,78.631121 C68.5931706,78.5366275 68.2396949,78.4901307 67.8882191,78.4901307 C66.959283,78.4901307 66.0463458,78.8141084 65.3173959,79.4255663 C64.6534416,79.982528 64.1979729,80.7304766 63.9999866,81.5509201 C63.8020002,80.7304766 63.3465315,79.982528 62.6825772,79.4255663 C61.6776463,78.5826243 60.3237395,78.2861447 59.0588265,78.631121 C57.8189118,78.9695977 56.5954959,79.3375724 55.4220767,79.7255457 C52.582272,80.6644811 50.2374333,82.7108403 48.8205308,85.4871494 C45.4702613,92.0516978 38.8272182,96.1294173 31.4837234,96.1294173 C26.1305917,96.1294173 21.139435,94.0025636 17.4296902,90.1403293 C13.7224452,86.2805948 11.7995775,81.2004442 12.0160626,75.8353133 C12.4145352,65.9489934 20.4594818,57.7605567 30.3308027,57.1945956 C38.0507716,56.752626 45.3102723,60.9188394 48.8245305,67.8103654 C50.2364334,70.5806748 52.5742726,72.6225343 55.4065777,73.5599698 C56.5834968,73.949443 57.8119123,74.3194176 59.0573266,74.6593942 C60.3242394,75.0048704 61.6786463,74.7073909 62.6830772,73.863449 C63.3470315,73.3054873 63.8020002,72.5560389 63.9994866,71.7345954 C64.196973,72.5560389 64.6519417,73.3054873 65.315896,73.862949 C66.3208269,74.7073909 67.6757337,75.0048704 68.9416466,74.6593942 C70.186061,74.3199176 71.4134766,73.950443 72.5903956,73.5609698 C75.4237007,72.6235343 77.7625398,70.5806748 79.1754426,67.8093654 C82.6892009,60.9188394 89.9477016,56.7516261 97.6681705,57.1950956 C107.539491,57.7610567 115.584438,65.9489934 115.982911,75.8358133 C116.199396,81.2004442 114.277028,86.2805948 110.569783,90.1398293 Z"
        id="Shape"
        fill={fill}
        fillRule="nonzero"
      ></path>
    </g>
  </svg>
);

export default SVG;
