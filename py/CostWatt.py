import pandas as pd
import math
import numpy as np
import flask

#input = [ [33,88] , 5332.8, 'MICHIGAN', 'INGHAM']

def CostWatt(cc,a,state,county):
  cc = cc.self #center coord [lat,long]
  a= a.self/4047 #area m^2 to  acres
  state = state.self
  county = county.self

  d = pd.read_csv('main.csv')
  c = d[(d['state'] == upper(state)) & (d['county'] == upper(county))]
  p = c.iloc[0].acre
  P=''
  for i in p:
    if i !=',':
      P= P+i
  P = int(P)*1.2
  LandCost = P*a

  s= [[32, -85], [48, -122], [35, -113],[45, -105],[40 ,-85],[42 , -75],[46, -70],[31, -95]]
  W=[]
  latT=0
  lngT=0
  for i in range(len(s)):
    W+= [[math.sqrt((s[i][0]- cc[0])**2), math.sqrt((s[i][1]- cc[1])**2)]]
    latT+=W[i][0]
    lngT+=W[i][1]

  for i in range(len(W)):
    W[i]=[W[i][0] / (2*latT) + W[i][1]/ (2*lngT)]

  d = pd.read_csv('fwm.csv')
  w = np.array(W)
  v= np.array(d[2:])
  I = np.dot(v,w)
  I = I*.27

  wattsPerM=I.tolist()
  return LandCost, wattsPerM
