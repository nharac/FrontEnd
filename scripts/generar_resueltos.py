import json, random
from fractions import Fraction as F
from math import gcd
random.seed(2026)
M='−'
def n(x):
    x=F(x)
    s=str(abs(x.numerator)) if x.denominator==1 else f"{abs(x.numerator)}/{x.denominator}"
    return (M+s) if x<0 else s
def np_(x):  # number in parentheses if negative
    return f"({n(x)})" if F(x)<0 else n(x)
def sg(x, first=False):  # signed term "+ 3" / "− 3"
    x=F(x)
    if first: return n(x)
    return f"+ {n(x)}" if x>=0 else f"{M} {n(-x)}"
SUP=str.maketrans('0123456789-','⁰¹²³⁴⁵⁶⁷⁸⁹⁻')
def pw(k): return '' if k==1 else str(k).translate(SUP)
def poly(c, v='x'):  # c: dict exp->coef, descending
    t=[]
    for e in sorted(c, reverse=True):
        a=F(c[e])
        if a==0: continue
        if e==0: body=n(abs(a))
        else:
            co='' if abs(a)==1 else n(abs(a))
            body=f"{co}{v}{pw(e)}"
        if not t: t.append((M if a<0 else '')+body)
        else: t.append(('+ ' if a>0 else M+' ')+body)
    return ' '.join(t) if t else '0'
E=[]
VISTOS=set()
def add(tema,nivel,titulo,enun,pasos,resp,clave):
    if enun in VISTOS: return
    VISTOS.add(enun)
    if len(pasos)<2: pasos=pasos+[(f"Resultado: {resp}","Se revisa que ya no se pueda simplificar más.")]
    E.append(dict(tema=tema,nivel=nivel,titulo=titulo,enunciado=enun,pasos=[dict(paso=a,porque=b) for a,b in pasos],respuesta=resp,clave=clave))
def nz(a,b):
    while True:
        v=random.randint(a,b)
        if v: return v

# ================= FUNDAMENTOS (60) =================
for i in range(15):  # suma/resta de fracciones
    a,b=random.randint(1,9),random.randint(2,9); c,d=random.randint(1,9),random.randint(2,9)
    while b==d: d=random.randint(2,9)
    op=random.choice(['+',M])
    num=a*d+c*b if op=='+' else a*d-c*b
    r=F(num,b*d)
    pasos=[(f"Denominador común: {b} · {d} = {b*d}","Para sumar o restar fracciones, las partes deben ser del mismo tamaño: eso lo da un denominador común."),
           (f"{a}/{b} = {a*d}/{b*d}   y   {c}/{d} = {c*b}/{b*d}","Se multiplica arriba y abajo por el mismo número, así la fracción vale lo mismo."),
           (f"({a*d} {op} {c*b})/{b*d} = {n(F(num))}/{b*d}","Con el mismo denominador solo se opera el numerador.")]
    if r.denominator!=b*d: pasos.append((f"{n(F(num))}/{b*d} = {n(r)}",f"Se simplifica dividiendo arriba y abajo entre {gcd(abs(num),b*d)}."))
    add('fundamentos','Básico',f"{'Suma' if op=='+' else 'Resta'} de fracciones",f"Calcula {a}/{b} {op} {c}/{d}",pasos,n(r),"Primero denominador común; luego se opera solo arriba y se simplifica.")
for i in range(10):  # multiplicación / división
    a,b,c,d=random.randint(1,9),random.randint(2,9),random.randint(1,9),random.randint(2,9)
    if i%2==0:
        r=F(a*c,b*d)
        pasos=[(f"({a}·{c})/({b}·{d}) = {a*c}/{b*d}","Para multiplicar fracciones se multiplica arriba con arriba y abajo con abajo.")]
        if r!=F(a*c)/F(b*d) or r.denominator!=b*d: pasos.append((f"{a*c}/{b*d} = {n(r)}","Se simplifica al máximo."))
        add('fundamentos','Básico','Multiplicación de fracciones',f"Calcula ({a}/{b}) · ({c}/{d})",pasos,n(r),"Arriba por arriba, abajo por abajo, y simplifica.")
    else:
        r=F(a*d,b*c)
        pasos=[(f"({a}/{b}) ÷ ({c}/{d}) = ({a}/{b}) · ({d}/{c})","Dividir entre una fracción es multiplicar por su inversa (se voltea la segunda)."),
               (f"= {a*d}/{b*c}","Ahora es una multiplicación normal.")]
        if r.denominator!=b*c: pasos.append((f"= {n(r)}","Se simplifica."))
        add('fundamentos','Intermedio','División de fracciones',f"Calcula ({a}/{b}) ÷ ({c}/{d})",pasos,n(r),"Dividir es multiplicar por el inverso.")
for i in range(10):  # jerarquía
    a,b,c,d=random.randint(2,9),random.randint(2,9),random.randint(2,6),random.randint(1,9)
    r=a+b*c-d
    add('fundamentos','Básico','Jerarquía de operaciones',f"Calcula {a} + {b} · {c} {M} {d}",
        [(f"{b} · {c} = {b*c}","La multiplicación va antes que la suma y la resta."),
         (f"{a} + {b*c} {M} {d}","Se reemplaza el resultado de la multiplicación."),
         (f"= {a+b*c} {M} {d} = {n(r)}","Sumas y restas se hacen de izquierda a derecha.")],n(r),"Primero × y ÷, después + y −.")
for i in range(30):  # potencias
    base=random.randint(2,5); m,k=random.randint(2,6),random.randint(2,6)
    add('fundamentos','Intermedio','Propiedades de potencias',f"Simplifica x{pw(m)} · x{pw(k)} ÷ x{pw(min(m,k))}",
        [(f"x{pw(m)} · x{pw(k)} = x{pw(m+k)}","Al multiplicar potencias de la misma base, los exponentes se suman."),
         (f"x{pw(m+k)} ÷ x{pw(min(m,k))} = x{pw(m+k-min(m,k))}","Al dividir potencias de la misma base, los exponentes se restan.")],f"x{pw(max(m,k))}","Misma base: multiplicar suma exponentes y dividir los resta.")
for i in range(15):  # porcentajes
    p=random.choice([5,10,12,15,20,25,30,35,40,50]); N=random.choice([40,60,80,120,160,200,240,300,400,500,800,1200])
    v=F(p*N,100)
    if i%3==0:
        add('fundamentos','Básico','Porcentaje de una cantidad',f"¿Cuánto es el {p} % de {N}?",
            [(f"{p} % = {p}/100","Por ciento significa 'de cada 100'."),(f"({p}/100) · {N} = {n(v)}","El 'de' en matemáticas es una multiplicación.")],n(v),"p % de N = p·N/100.")
    else:
        fin=N-v
        add('fundamentos','Intermedio','Descuento',f"Un producto cuesta ${N} y tiene {p} % de descuento. ¿Cuánto se paga?",
            [(f"Descuento: ({p}/100) · {N} = {n(v)}","Primero se calcula cuánto dinero se descuenta."),
             (f"{N} {M} {n(v)} = {n(fin)}","Se resta el descuento al precio original."),
             (f"Atajo: {N} · (1 {M} {p}/100) = {N} · {n(F(100-p,100))} = {n(fin)}","Pagar con descuento es pagar el (100 − p) % del precio.")],f"${n(fin)}","Con descuento del p % se paga (100 − p) % del precio.")

# ================= ÁLGEBRA (60) =================
for i in range(15):  # lineales
    x=nz(-9,9); a=nz(2,7)*random.choice([1,-1]); b=random.randint(-12,12); c=a*x+b
    add('algebra','Básico','Ecuación lineal',f"Resuelve {poly({1:a,0:b})} = {n(c)}",
        [(f"{poly({1:a})} = {n(c)} {sg(-b)}","Se pasa el término independiente al otro lado con la operación contraria."),
         (f"{poly({1:a})} = {n(c-b)}","Se opera el lado derecho."),
         (f"x = {n(c-b)} / {np_(a)} = {n(x)}",f"Como x está multiplicada por {n(a)}, se divide entre {n(a)} en ambos lados.")],f"x = {n(x)}","Despejar es deshacer operaciones en orden inverso.")
for i in range(15):  # cuadráticas por factorización
    r1,r2=nz(-8,8),nz(-8,8)
    b,c=-(r1+r2),r1*r2
    add('algebra','Intermedio','Ecuación cuadrática por factorización',f"Resuelve {poly({2:1,1:b,0:c})} = 0",
        [(f"Busco dos números que multiplicados den {n(c)} y sumados den {n(b)}: {n(-r1)} y {n(-r2)}","Así se factoriza un trinomio x² + bx + c."),
         (f"(x {sg(-r1)})(x {sg(-r2)}) = 0","Se escribe el trinomio como producto de dos binomios."),
         (f"x {sg(-r1)} = 0  o  x {sg(-r2)} = 0","Si un producto es cero, al menos un factor es cero."),
         (f"x = {n(r1)}  o  x = {n(r2)}","Se despeja cada factor.")],
        f"x = {n(r1)}, x = {n(r2)}" if r1!=r2 else f"x = {n(r1)} (doble)","Factoriza, iguala cada factor a cero y despeja.")
for i in range(10):  # fórmula cuadrática
    a=random.randint(1,3); r1,r2=nz(-6,6),nz(-6,6)
    b,c=-a*(r1+r2),a*r1*r2; D=b*b-4*a*c; s=int(round(D**0.5))
    add('algebra','Intermedio','Fórmula cuadrática',f"Resuelve {poly({2:a,1:b,0:c})} = 0 con la fórmula general",
        [(f"a = {a}, b = {n(b)}, c = {n(c)}","Se identifican los coeficientes."),
         (f"Δ = b² {M} 4ac = {n(b*b)} {M} {np_(4*a*c)} = {n(D)}","El discriminante dice cuántas soluciones hay."),
         (f"√Δ = {s}","Δ ≥ 0, entonces hay soluciones reales."),
         (f"x = ({n(-b)} ± {s}) / {2*a}","x = (−b ± √Δ) / 2a."),
         (f"x₁ = {n(F(-b+s,2*a))},  x₂ = {n(F(-b-s,2*a))}","Se calcula con + y con −.")],
        f"x = {n(F(-b+s,2*a))}, x = {n(F(-b-s,2*a))}","Δ > 0: dos soluciones; Δ = 0: una; Δ < 0: ninguna real.")
for i in range(10):  # sistemas 2x2 sustitución / reducción
    x,y=nz(-6,6),nz(-6,6); a1,b1=nz(1,4),nz(-4,4); a2,b2=nz(1,4),nz(-4,4)
    while a1*b2-a2*b1==0: b2=nz(-4,4)
    c1,c2=a1*x+b1*y,a2*x+b2*y
    e1,e2=f"{poly({1:a1})} {sg(b1)}y = {n(c1)}".replace(' 1y',' y'),f"{poly({1:a2})} {sg(b2)}y = {n(c2)}".replace(' 1y',' y')
    add('algebra','Avanzado','Sistema 2×2 por reducción',f"Resuelve: {e1};  {e2}",
        [(f"Multiplico la 1.ª por {a2} y la 2.ª por {a1}","Así x tiene el mismo coeficiente en las dos y se puede eliminar."),
         (f"{n(a1*a2)}x {sg(b1*a2)}y = {n(c1*a2)}  y  {n(a1*a2)}x {sg(b2*a1)}y = {n(c2*a1)}","Ecuaciones equivalentes."),
         (f"({n(b1*a2)} {M} {np_(b2*a1)})y = {n(c1*a2)} {M} {np_(c2*a1)}  ⇒  {n(b1*a2-b2*a1)}y = {n(c1*a2-c2*a1)}","Al restar, x desaparece."),
         (f"y = {n(y)}","Se despeja y."),
         (f"{poly({1:a1})} {sg(b1)}·{np_(y)} = {n(c1)}  ⇒  x = {n(x)}","Se reemplaza y en la primera ecuación y se despeja x.")],
        f"x = {n(x)}, y = {n(y)}","Iguala coeficientes, resta para eliminar una variable y reemplaza.")
for i in range(10):  # factorización diferencia de cuadrados / factor común
    k=random.randint(2,9); m=random.randint(1,5)
    if i%2==0:
        add('algebra','Básico','Diferencia de cuadrados',f"Factoriza {m*m if m>1 else ''}x² {M} {k*k}",
            [(f"{m*m if m>1 else ''}x² = ({m if m>1 else ''}x)²  y  {k*k} = {k}²","Se reconoce que ambos términos son cuadrados perfectos."),
             (f"a² {M} b² = (a {M} b)(a + b)","Fórmula de diferencia de cuadrados.")],f"({m if m>1 else ''}x {M} {k})({m if m>1 else ''}x + {k})","a² − b² = (a − b)(a + b).")
    else:
        add('algebra','Básico','Factor común',f"Factoriza {poly({2:k*m,1:k})}",
            [(f"Factor común: {k}x","Es lo que se repite en todos los términos (número y letra con el menor exponente)."),
             (f"{poly({2:k*m,1:k})} = {k}x({poly({1:m,0:1})})","Se divide cada término entre el factor común.")],f"{k}x({poly({1:m,0:1})})","Siempre busca primero el factor común.")

# ================= TRIGONOMETRÍA (55) =================
NOT={30:('1/2','√3/2','√3/3'),45:('√2/2','√2/2','1'),60:('√3/2','1/2','√3')}
for i in range(15):
    ang=random.choice([30,60]); h=random.choice([2,4,6,8,10,12,14,16,20])
    if ang==30: op=F(h,2); add('trigonometria','Básico','Cateto con seno',f"En un triángulo rectángulo la hipotenusa mide {h} y un ángulo agudo es 30°. ¿Cuánto mide el cateto opuesto a ese ángulo?",
        [("sen 30° = opuesto / hipotenusa","SOH: el seno relaciona el cateto opuesto con la hipotenusa."),(f"opuesto = {h} · sen 30° = {h} · 1/2","Se despeja multiplicando por la hipotenusa."),(f"opuesto = {n(op)}","sen 30° = 1/2 es un valor notable.")],n(op),"Opuesto = hipotenusa · seno.")
    else: ad=F(h,2); add('trigonometria','Básico','Cateto con coseno',f"En un triángulo rectángulo la hipotenusa mide {h} y un ángulo agudo es 60°. ¿Cuánto mide el cateto adyacente?",
        [("cos 60° = adyacente / hipotenusa","CAH: el coseno relaciona el cateto adyacente con la hipotenusa."),(f"adyacente = {h} · cos 60° = {h} · 1/2","Se despeja."),(f"adyacente = {n(ad)}","cos 60° = 1/2.")],n(ad),"Adyacente = hipotenusa · coseno.")
TRIPLES=[(3,4,5),(5,12,13),(8,15,17),(7,24,25),(6,8,10),(9,12,15),(12,16,20),(20,21,29),(9,40,41),(15,20,25)]
for i,(a,b,c) in enumerate(TRIPLES):
    if i%2==0:
        add('trigonometria','Básico','Teorema de Pitágoras',f"Los catetos de un triángulo rectángulo miden {a} y {b}. Halla la hipotenusa.",
            [("c² = a² + b²","Pitágoras vale en triángulos rectángulos; c es la hipotenusa."),(f"c² = {a*a} + {b*b} = {c*c}","Se elevan al cuadrado y se suman."),(f"c = √{c*c} = {c}","Se saca la raíz cuadrada (la longitud es positiva).")],str(c),"Hipotenusa² = suma de los catetos al cuadrado.")
    else:
        add('trigonometria','Básico','Cateto con Pitágoras',f"La hipotenusa mide {c} y un cateto mide {a}. Halla el otro cateto.",
            [("b² = c² − a²","Se despeja el cateto desconocido de c² = a² + b²."),(f"b² = {c*c} {M} {a*a} = {b*b}","Se reemplaza."),(f"b = {b}","Raíz cuadrada.")],str(b),"Para un cateto: c² − el otro cateto².")
for i in range(10):
    g=random.choice([15,20,30,36,40,45,60,72,90,120,135,150,180,210,225,240,270,300,315,330])
    r=F(g,180)
    rs=('π' if r==1 else f"{r.numerator}π/{r.denominator}" if r.denominator!=1 else f"{r.numerator}π").replace('1π/','π/')
    add('trigonometria','Básico','Grados a radianes',f"Convierte {g}° a radianes.",
        [("180° = π rad","Es la equivalencia base entre ambas medidas."),(f"{g}° · π/180° = {g}π/180","Se multiplica por π/180 para cancelar los grados."),(f"= {rs}",f"Se simplifica {g}/180.")],f"{rs} rad","Grados → radianes: × π/180.")
for i in range(10):
    k=random.randint(1,4)
    q=random.choice([('sen² x + cos² x','1','identidad pitagórica'),('1 − cos² x','sen² x','sen² x = 1 − cos² x'),('1 − sen² x','cos² x','cos² x = 1 − sen² x'),('tan x · cos x','sen x','tan x = sen x / cos x'),('2 sen x cos x','sen 2x','ángulo doble')])
    add('trigonometria','Intermedio','Simplificar con identidades',f"Simplifica {k if k>1 else ''}({q[0]})" if k>1 else f"Simplifica {q[0]}",
        [(f"{q[0]} = {q[1]}",f"Se usa la {q[2]}."),(f"Resultado: {(str(k)+' ') if k>1 else ''}{q[1]}","Se reemplaza en la expresión original.")],f"{(str(k)+' ') if k>1 else ''}{q[1]}","Memoriza las identidades básicas: simplifican casi todo.")
for i in range(10):
    ang=random.choice([30,45,60]); fn=random.choice(['sen','cos','tan']); idx={'sen':0,'cos':1,'tan':2}[fn]
    add('trigonometria','Básico','Valor notable',f"¿Cuánto vale {fn} {ang}°?",
        [(f"Triángulo de referencia para {ang}°","Los ángulos de 30°, 45° y 60° salen de triángulos conocidos (mitad de equilátero o cuadrado partido)."),
         (f"{fn} {ang}° = {NOT[ang][idx]}","Se lee la razón en ese triángulo.")],NOT[ang][idx],"sen 30° = 1/2, sen 45° = √2/2, sen 60° = √3/2; el coseno va al revés.")

# ================= LÍMITES (55) =================
for i in range(15):
    a=nz(-4,4); c={2:nz(-3,3),1:random.randint(-5,5),0:random.randint(-9,9)}
    val=sum(F(v)*a**e for e,v in c.items())
    add('limites','Básico','Límite por sustitución',f"Calcula lim(x→{n(a)}) ({poly(c)})",
        [("Es un polinomio: es continuo","En funciones continuas el límite es simplemente el valor de la función."),
         (f"Reemplazo x = {n(a)}: "+' '.join([f"{('' if j==0 else '+ ')}{np_(v)}·{np_(a)}{pw(e) if e else ''}" for j,(e,v) in enumerate(sorted(c.items(),reverse=True)) if e]+[f"{sg(c[0])}"]),"Se sustituye directamente."),
         (f"= {n(val)}","Se opera.")],n(val),"Primero intenta sustituir; si no da 0/0, ese es el límite.")
for i in range(20):
    a=nz(-7,7)
    if i%2==0:
        add('limites','Intermedio','Indeterminación 0/0 (diferencia de cuadrados)',f"Calcula lim(x→{n(a)}) ({poly({2:1,0:-a*a})}) / (x {sg(-a)})",
            [(f"Al sustituir: ({n(a*a)} {M} {a*a}) / ({n(a)} {sg(-a)}) = 0/0","0/0 no es un resultado: indica que hay un factor que se puede cancelar."),
             (f"x² {M} {a*a} = (x {sg(-a)})(x {sg(a)})","Diferencia de cuadrados."),
             (f"Cancelo (x {sg(-a)}): queda x {sg(a)}","Para x ≠ a ese factor no es cero y se puede simplificar."),
             (f"lim(x→{n(a)}) (x {sg(a)}) = {n(2*a)}","Ahora sí se sustituye.")],n(2*a),"0/0: factoriza y cancela el factor que da cero.")
    else:
        b=nz(-6,6)
        while b==a: b=nz(-6,6)
        add('limites','Intermedio','Indeterminación 0/0 (trinomio)',f"Calcula lim(x→{n(a)}) ({poly({2:1,1:-(a+b),0:a*b})}) / (x {sg(-a)})",
            [("Al sustituir sale 0/0","Hay un factor (x − a) escondido arriba."),
             (f"{poly({2:1,1:-(a+b),0:a*b})} = (x {sg(-a)})(x {sg(-b)})","Se factoriza el trinomio buscando dos números."),
             (f"Cancelo: queda x {sg(-b)}","Se elimina el factor común."),
             (f"= {n(a)} {sg(-b)} = {n(a-b)}","Se sustituye.")],n(a-b),"Si sale 0/0, (x − a) es factor del numerador.")
for i in range(20):
    g=random.choice(['igual','menor','mayor']); a,b=nz(1,9)*random.choice([1,-1]),nz(1,9)
    if g=='igual':
        add('limites','Intermedio','Límite al infinito (mismo grado)',f"Calcula lim(x→∞) ({poly({2:a,1:random.randint(-5,5),0:random.randint(-9,9)})}) / ({poly({2:b,0:random.randint(1,9)})})",
            [("Divido arriba y abajo entre x²","Es la mayor potencia; así se ve qué términos mandan."),("Los términos con 1/x o 1/x² tienden a 0","Cuando x crece muchísimo, dividir entre x da casi cero."),(f"Queda {n(a)}/{b} = {n(F(a,b))}","Solo sobreviven los coeficientes principales.")],n(F(a,b)),"Mismo grado: cociente de coeficientes principales.")
    elif g=='menor':
        add('limites','Básico','Límite al infinito (grado menor arriba)',f"Calcula lim(x→∞) ({poly({1:a,0:random.randint(1,9)})}) / ({poly({2:b,0:random.randint(1,9)})})",
            [("El grado de arriba (1) es menor que el de abajo (2)","El denominador crece más rápido."),("Divido entre x²: arriba quedan términos que tienden a 0, abajo queda "+str(b),"Se compara el crecimiento.")],"0","Grado arriba < grado abajo ⇒ límite 0.")
    else:
        add('limites','Intermedio','Límite al infinito (grado mayor arriba)',f"Calcula lim(x→∞) ({poly({3:abs(a),0:1})}) / ({poly({1:b,0:random.randint(1,9)})})",
            [("El grado de arriba (3) es mayor que el de abajo (1)","El numerador crece mucho más rápido."),(f"Se comporta como {abs(a)}x³/({b}x) = {n(F(abs(a),b))}x²","Se comparan los términos dominantes."),("x² → ∞","Crece sin límite.")],"∞","Grado arriba > grado abajo ⇒ el límite es infinito.")

# ================= DERIVADAS (60) =================
def der(c): return {e-1:v*e for e,v in c.items() if e>0}
for i in range(20):
    c={random.randint(3,5):nz(-6,6),2:nz(-9,9),1:random.randint(-9,9),0:random.randint(-9,9)}
    d=der(c)
    add('derivadas','Básico','Regla de la potencia',f"Deriva f(x) = {poly(c)}",
        [("Se deriva término por término","La derivada de una suma es la suma de las derivadas."),
         ("d/dx(axⁿ) = a·n·xⁿ⁻¹","El exponente baja multiplicando y se le resta 1."),
         ("La constante se vuelve 0","Lo que no depende de x no cambia."),
         (f"f′(x) = {poly(d)}","Se juntan los resultados.")],f"f′(x) = {poly(d)}","Baja el exponente, réstale 1; las constantes desaparecen.")
for i in range(15):
    a,b,k=nz(1,6),nz(-9,9),random.randint(2,7)
    add('derivadas','Intermedio','Regla de la cadena',f"Deriva f(x) = ({poly({1:a,0:b})}){pw(k)}",
        [(f"Afuera: u{pw(k)}  ·  adentro: u = {poly({1:a,0:b})}","Es una función dentro de otra."),
         (f"Derivada de afuera: {k}u{pw(k-1)}","Regla de la potencia sobre u."),
         (f"Derivada de adentro: u′ = {a}","Se deriva lo de adentro."),
         (f"f′(x) = {k}({poly({1:a,0:b})}){pw(k-1)} · {a} = {k*a}({poly({1:a,0:b})}){pw(k-1)}","Cadena: derivada de afuera por derivada de adentro.")],
        f"f′(x) = {k*a}({poly({1:a,0:b})}){pw(k-1)}","Derivada de afuera (sin tocar lo de adentro) por derivada de adentro.")
for i in range(15):
    a,b=nz(1,5),random.randint(2,4)
    fn=random.choice(['sen x','cos x','eˣ','ln x'])
    dfn={'sen x':'cos x','cos x':f'{M}sen x','eˣ':'eˣ','ln x':'1/x'}[fn]
    u=poly({b:a})
    add('derivadas','Intermedio','Regla del producto',f"Deriva f(x) = {u} · {fn}",
        [(f"u = {u},  v = {fn}","Es un producto de dos funciones."),
         (f"u′ = {poly({b-1:a*b})},  v′ = {dfn}","Se deriva cada una por separado."),
         ("(u·v)′ = u′·v + u·v′","Regla del producto: no es multiplicar las derivadas."),
         (f"f′(x) = {poly({b-1:a*b})}·{fn} + {u}·{dfn}".replace(f'+ {u}·{M}',f'{M} {u}·'),"Se reemplaza.")]+([(f"f′(x) = {poly({b-1:a*b})}·ln x + {poly({b-1:a})}","x² · (1/x) = x: se simplifica el último término.")] if fn=='ln x' else []),
        (f"f′(x) = {poly({b-1:a*b})}·ln x + {poly({b-1:a})}" if fn=='ln x' else f"f′(x) = {poly({b-1:a*b})}·{fn} + {u}·{dfn}".replace(f'+ {u}·{M}',f'{M} {u}·')),"(uv)′ = u′v + uv′.")
for i in range(10):
    c={2:nz(-3,3),1:random.randint(-6,6),0:random.randint(-5,5)}; a=nz(-3,3)
    fa=sum(F(v)*a**e for e,v in c.items()); m=sum(F(v)*e*a**(e-1) for e,v in c.items() if e)
    bq=fa-m*a
    add('derivadas','Avanzado','Recta tangente',f"Halla la recta tangente a f(x) = {poly(c)} en x = {n(a)}",
        [(f"f({n(a)}) = {n(fa)}","El punto de tangencia es (a, f(a))."),
         (f"f′(x) = {poly(der(c))}","La derivada da la pendiente en cada punto."),
         (f"m = f′({n(a)}) = {n(m)}","Pendiente de la tangente en x = a."),
         (f"y {sg(-fa)} = {n(m)}(x {sg(-a)})","Ecuación punto-pendiente."),
         (f"y = {poly({1:m,0:bq})}","Se despeja y.")],f"y = {poly({1:m,0:bq})}","La derivada en a es la pendiente de la tangente.")

# ================= INTEGRALES (55) =================
def integ(c): return {e+1:F(v,e+1) for e,v in c.items()}
for i in range(20):
    c={random.randint(2,4):nz(-8,8),1:nz(-9,9),0:random.randint(-9,9)}
    I=integ(c)
    add('integrales','Básico','Integral indefinida de un polinomio',f"Calcula ∫ ({poly(c)}) dx",
        [("Se integra término por término","La integral de una suma es la suma de las integrales."),
         ("∫ xⁿ dx = xⁿ⁺¹/(n+1)","Se suma 1 al exponente y se divide entre el nuevo exponente."),
         (f"= {poly(I)} + C","Se agrega C porque al derivar cualquier constante da 0.")],f"{poly(I)} + C","Sube el exponente y divide entre él; no olvides + C.")
for i in range(20):
    c={2:nz(-3,3),1:random.randint(-6,6),0:random.randint(-5,5)}; a=random.randint(-2,1); b=a+random.randint(1,3)
    I=integ(c); Fa=sum(v*F(a)**e for e,v in I.items()); Fb=sum(v*F(b)**e for e,v in I.items())
    add('integrales','Intermedio','Integral definida',f"Calcula ∫ de {n(a)} a {n(b)} de ({poly(c)}) dx",
        [(f"F(x) = {poly(I)}","Primero se halla una primitiva (en la definida no hace falta C)."),
         (f"F({n(b)}) = {n(Fb)}","Se evalúa en el límite superior."),
         (f"F({n(a)}) = {n(Fa)}","Se evalúa en el límite inferior."),
         (f"F({n(b)}) {M} F({n(a)}) = {n(Fb)} {M} {np_(Fa)} = {n(Fb-Fa)}","Teorema fundamental del cálculo.")],n(Fb-Fa),"∫ₐᵇ f = F(b) − F(a).")
for i in range(15):
    a,b,k=nz(1,5),nz(-6,6),random.randint(2,5)
    add('integrales','Avanzado','Sustitución',f"Calcula ∫ {a}({poly({1:a,0:b})}){pw(k)} dx",
        [(f"u = {poly({1:a,0:b})}  ⇒  du = {a} dx","Se elige u como lo de adentro: su derivada aparece afuera."),
         (f"∫ u{pw(k)} du","La integral queda más simple."),
         (f"= u{pw(k+1)}/{k+1} + C","Regla de la potencia."),
         (f"= ({poly({1:a,0:b})}){pw(k+1)}/{k+1} + C","Se regresa a x.")],f"({poly({1:a,0:b})}){pw(k+1)}/{k+1} + C","Busca una función cuya derivada también esté en la integral.")

# ================= ÁLGEBRA LINEAL (60) =================
def mat(A): return '[' + '; '.join(' '.join(n(v) for v in fila) for fila in A) + ']'
def rnd(r,c,lo=-6,hi=6): return [[random.randint(lo,hi) for _ in range(c)] for _ in range(r)]
for i in range(8):
    A,B=rnd(2,2),rnd(2,2); S=[[A[r][c]+B[r][c] for c in range(2)] for r in range(2)]
    add('algebra_lineal','Básico','Suma de matrices',f"Calcula A + B con A = {mat(A)} y B = {mat(B)}",
        [("Las dos son 2×2: se pueden sumar","Solo se suman matrices del mismo tamaño."),
         ("Se suma posición por posición","Cada elemento del resultado es aᵢⱼ + bᵢⱼ."),
         (f"A + B = {mat(S)}","Resultado.")],mat(S),"Suma elemento a elemento, mismo tamaño.")
for i in range(6):
    k=nz(-5,5); A=rnd(2,3); S=[[k*v for v in f] for f in A]
    add('algebra_lineal','Básico','Escalar por matriz',f"Calcula {n(k)}·A con A = {mat(A)}",
        [(f"Se multiplica cada elemento por {n(k)}","Un escalar afecta a toda la matriz por igual."),(f"{n(k)}·A = {mat(S)}","Resultado.")],mat(S),"k·A: multiplica cada entrada por k.")
for i in range(10):
    A,B=rnd(2,2,-4,5),rnd(2,2,-4,5)
    P=[[sum(A[r][t]*B[t][c] for t in range(2)) for c in range(2)] for r in range(2)]
    pasos=[("(2×2)·(2×2) da 2×2","Se puede multiplicar porque las columnas de A = filas de B.")]
    for r in range(2):
        for c in range(2):
            pasos.append((f"c{r+1}{c+1} = {np_(A[r][0])}·{np_(B[0][c])} + {np_(A[r][1])}·{np_(B[1][c])} = {n(P[r][c])}",f"Fila {r+1} de A por columna {c+1} de B: se multiplican en orden y se suman."))
    pasos.append((f"A·B = {mat(P)}","Se arma la matriz."))
    add('algebra_lineal','Intermedio','Producto de matrices',f"Calcula A·B con A = {mat(A)} y B = {mat(B)}",pasos,mat(P),"Cada entrada = fila de la primera × columna de la segunda.")
for i in range(8):
    A=rnd(2,2,-7,8); d=A[0][0]*A[1][1]-A[0][1]*A[1][0]
    add('algebra_lineal','Básico','Determinante 2×2',f"Calcula det(A) con A = {mat(A)}",
        [("det [a b; c d] = ad − bc","Diagonal principal menos diagonal secundaria."),
         (f"= {np_(A[0][0])}·{np_(A[1][1])} {M} {np_(A[0][1])}·{np_(A[1][0])}","Se reemplazan los valores."),
         (f"= {n(A[0][0]*A[1][1])} {M} {np_(A[0][1]*A[1][0])} = {n(d)}","Se opera.")],n(d),"ad − bc. Si da 0, la matriz no tiene inversa.")
for i in range(8):
    A=rnd(3,3,-4,4)
    m=[A[1][1]*A[2][2]-A[1][2]*A[2][1],A[1][0]*A[2][2]-A[1][2]*A[2][0],A[1][0]*A[2][1]-A[1][1]*A[2][0]]
    d=A[0][0]*m[0]-A[0][1]*m[1]+A[0][2]*m[2]
    add('algebra_lineal','Avanzado','Determinante 3×3 (cofactores)',f"Calcula det(A) con A = {mat(A)}",
        [("Se desarrolla por la primera fila con signos + − +","Cada elemento se multiplica por el determinante 2×2 que queda al tapar su fila y su columna."),
         (f"M₁₁ = {n(m[0])},  M₁₂ = {n(m[1])},  M₁₃ = {n(m[2])}","Menores 2×2 (ad − bc de cada uno)."),
         (f"det = {np_(A[0][0])}·{np_(m[0])} {M} {np_(A[0][1])}·{np_(m[1])} + {np_(A[0][2])}·{np_(m[2])}","Se aplican los signos alternados."),
         (f"det = {n(d)}","Se opera.")],n(d),"Cofactores: + − + por la primera fila con sus menores.")
cnt=0
while cnt<8:
    A=rnd(2,2,-5,6); d=A[0][0]*A[1][1]-A[0][1]*A[1][0]
    if d==0: continue
    cnt+=1
    adj=[[A[1][1],-A[0][1]],[-A[1][0],A[0][0]]]; inv=[[F(v,d) for v in f] for f in adj]
    add('algebra_lineal','Intermedio','Inversa 2×2',f"Halla A⁻¹ con A = {mat(A)}",
        [(f"det(A) = {n(d)} ≠ 0","Si el determinante es distinto de cero, la matriz tiene inversa."),
         (f"Intercambio a y d, cambio el signo de b y c: {mat(adj)}","Es la matriz adjunta de una 2×2."),
         (f"A⁻¹ = (1/{np_(d)}) · {mat(adj)}","A⁻¹ = adj(A) / det(A)."),
         (f"A⁻¹ = {mat(inv)}","Se divide cada entrada entre el determinante.")],mat(inv),"2×2: cambia a↔d, niega b y c, y divide entre el determinante.")
def gj(A,b,var):
    nr=len(A); M_=[ [F(v) for v in A[r]]+[F(b[r])] for r in range(nr)]
    pasos=[(f"Matriz aumentada: {mat(M_)}","Se escriben los coeficientes y, a la derecha, los términos independientes.")]
    for c in range(nr):
        p=next(r for r in range(c,nr) if M_[r][c]!=0)
        if p!=c:
            M_[c],M_[p]=M_[p],M_[c]; pasos.append((f"F{c+1} ↔ F{p+1}: {mat(M_)}","Se intercambian filas para tener un pivote distinto de cero."))
        piv=M_[c][c]
        if piv!=1:
            M_[c]=[v/piv for v in M_[c]]; pasos.append((f"F{c+1} → F{c+1} / {np_(piv)}: {mat(M_)}","Se divide la fila entre el pivote para que quede un 1."))
        for r in range(nr):
            if r!=c and M_[r][c]!=0:
                f=M_[r][c]; M_[r]=[M_[r][k]-f*M_[c][k] for k in range(nr+1)]
                pasos.append((f"F{r+1} → F{r+1} {M} {np_(f)}·F{c+1}: {mat(M_)}",f"Se hace cero el resto de la columna {c+1} usando el pivote."))
    sol=', '.join(f"{var[r]} = {n(M_[r][nr])}" for r in range(nr))
    pasos.append((sol,"La matriz quedó como la identidad: la última columna es la solución."))
    return pasos,sol
for i in range(6):
    x,y=nz(-5,5),nz(-5,5)
    while True:
        A=rnd(2,2,-4,5)
        if A[0][0]*A[1][1]-A[0][1]*A[1][0]!=0: break
    b=[A[r][0]*x+A[r][1]*y for r in range(2)]
    eq='; '.join(f"{poly({1:A[r][0]})} {sg(A[r][1])}y = {n(b[r])}".replace('+ 1y','+ y').replace(f'{M} 1y',f'{M} y') for r in range(2))
    pasos,sol=gj(A,b,['x','y'])
    add('algebra_lineal','Intermedio','Gauss-Jordan 2×2',f"Resuelve por Gauss-Jordan: {eq}",pasos,sol,"Objetivo: dejar la identidad a la izquierda con operaciones de fila.")
for i in range(6):
    s=[nz(-4,4) for _ in range(3)]
    while True:
        A=rnd(3,3,-3,4)
        dt=A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1])-A[0][1]*(A[1][0]*A[2][2]-A[1][2]*A[2][0])+A[0][2]*(A[1][0]*A[2][1]-A[1][1]*A[2][0])
        if dt!=0: break
    b=[sum(A[r][k]*s[k] for k in range(3)) for r in range(3)]
    def eq3(r):
        t=poly({1:A[r][0]}) if A[r][0] else ''
        for coef,v in ((A[r][1],'y'),(A[r][2],'z')):
            if coef==0: continue
            term=(v if abs(coef)==1 else f"{abs(coef)}{v}")
            t=(t+' ' if t else '')+(('+ ' if coef>0 else M+' ') if t else ('' if coef>0 else M))+term
        return f"{t} = {n(b[r])}"
    pasos,sol=gj(A,b,['x','y','z'])
    add('algebra_lineal','Avanzado','Gauss-Jordan 3×3',f"Resuelve por Gauss-Jordan: {'; '.join(eq3(r) for r in range(3))}",pasos,sol,"Pivote en 1, ceros arriba y abajo, columna por columna.")
cnt=0
while cnt<4:
    A=rnd(2,2,-4,5); d=A[0][0]*A[1][1]-A[0][1]*A[1][0]
    if d==0: continue
    cnt+=1
    M_=[[F(A[r][c]) for c in range(2)]+[F(1 if r==k else 0) for k in range(2)] for r in range(2)]
    pasos=[(f"[A | I] = {mat(M_)}","Se pone la identidad al lado: lo que le pase a A le pasa a I.")]
    for c in range(2):
        p=next(r for r in range(c,2) if M_[r][c]!=0)
        if p!=c: M_[c],M_[p]=M_[p],M_[c]; pasos.append((f"F1 ↔ F2: {mat(M_)}","Pivote distinto de cero."))
        pv=M_[c][c]
        if pv!=1: M_[c]=[v/pv for v in M_[c]]; pasos.append((f"F{c+1} / {np_(pv)}: {mat(M_)}","Pivote en 1."))
        o=1-c
        if M_[o][c]!=0:
            f=M_[o][c]; M_[o]=[M_[o][k]-f*M_[c][k] for k in range(4)]; pasos.append((f"F{o+1} {M} {np_(f)}·F{c+1}: {mat(M_)}","Cero en la otra fila."))
    inv=[f[2:] for f in M_]
    pasos.append((f"A⁻¹ = {mat(inv)}","A la izquierda quedó I; a la derecha está la inversa."))
    add('algebra_lineal','Avanzado','Inversa por Gauss-Jordan',f"Halla A⁻¹ con Gauss-Jordan, A = {mat(A)}",pasos,mat(inv),"[A | I] → [I | A⁻¹] con operaciones de fila.")
for i in range(4):
    A=rnd(2,3); T=[[A[r][c] for r in range(2)] for c in range(3)]
    add('algebra_lineal','Básico','Matriz transpuesta',f"Halla Aᵀ con A = {mat(A)}",
        [("Las filas pasan a ser columnas","La transpuesta intercambia filas y columnas: aᵢⱼ pasa a la posición ji."),
         ("A es 2×3, Aᵀ es 3×2","El tamaño también se voltea."),(f"Aᵀ = {mat(T)}","Resultado.")],mat(T),"Transponer: la fila 1 se vuelve la columna 1.")

pref={'fundamentos':'fun','algebra':'alg','trigonometria':'tri','limites':'lim','derivadas':'der','integrales':'int','algebra_lineal':'lin'}
cnt={}
for e in E:
    cnt[e['tema']]=cnt.get(e['tema'],0)+1
    e['id']=f"g-{pref[e['tema']]}-{cnt[e['tema']]}"
print(cnt, len(E))
out=["// Archivo generado: ejercicios resueltos paso a paso (calculados con aritmética exacta, sin IA).",
     "import type { EjercicioResuelto } from './ejercicios-resueltos';","",
     "export const EJERCICIOS_GENERADOS: EjercicioResuelto[] = "+json.dumps([{k:e[k] for k in ['id','tema','nivel','titulo','enunciado','pasos','respuesta','clave']} for e in E],ensure_ascii=False,indent=1)+";",""]
open('src/app/features/resueltos/models/ejercicios-generados.ts','w').write('\n'.join(out))
